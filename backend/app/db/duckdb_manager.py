"""Manages per-dataset DuckDB connections with persistent file-backed storage,
idle eviction, active query protection, and multi-worker compatibility.

Each dataset is stored as a persistent DuckDB database file ('{dataset_id}.duckdb')
inside the upload directory. Connections are worker-local caches of persistent state.
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
import threading
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

import duckdb

from app.config import settings
from app.utils.file_utils import validate_dataset_id

logger = logging.getLogger(__name__)


def filename_to_table_name(filename: str) -> str:
    """Convert a filename like 'sales_2024.csv' -> 'sales_2024'."""
    stem = re.sub(r"\.[^.]+$", "", filename)          # strip extension
    stem = re.sub(r"[^A-Za-z0-9_]", "_", stem)       # replace unsafe chars
    stem = re.sub(r"_+", "_", stem).strip("_")        # collapse underscores
    if not stem or stem[0].isdigit():
        stem = "data_" + stem                          # ensure valid identifier
    return stem.lower()


class DuckDBManager:
    """Thread-safe registry and cache of DuckDB connections with idle expiration and persistence."""

    # Fallback / legacy constant kept for backward compatibility
    TABLE_NAME = "uploaded_data"

    def __init__(self) -> None:
        self._connections: dict[str, duckdb.DuckDBPyConnection] = {}
        self._table_names: dict[str, list[str]] = {}
        self._owners: dict[str, str] = {}
        self._last_active: dict[str, float] = {}       # monotonic clock timestamp
        self._in_use: dict[str, int] = {}              # active query counter
        self._lock = threading.RLock()
        self._idle_timeout: float = float(settings.duckdb_idle_timeout_seconds)
        self._max_cached: int = settings.duckdb_max_connections

    def get_database_path(self, dataset_id: str) -> Path:
        """Return the filesystem path for the persistent DuckDB file for dataset_id."""
        if dataset_id == ":memory:":
            return Path(":memory:")
        safe_id = validate_dataset_id(dataset_id)
        upload_dir = Path(settings.upload_dir)
        return upload_dir / f"{safe_id}.duckdb"

    def set_dataset_owner(self, dataset_id: str, owner_id: str) -> None:
        """Record dataset owner in the in-memory cache."""
        with self._lock:
            self._owners[dataset_id] = owner_id

    def get_dataset_owner(self, dataset_id: str) -> str | None:
        """Retrieve dataset owner from the in-memory cache."""
        with self._lock:
            return self._owners.get(dataset_id)

    def _configure_connection(self, conn: duckdb.DuckDBPyConnection, read_only: bool = False) -> None:
        """Apply memory, thread, and security resource limits to a DuckDB connection.
        
        For read-only connections (querying and exports), disables external access at
        the engine level to prevent OS command execution, arbitrary file access, and extension loading.
        """
        try:
            conn.execute("SET threads = 2")
            conn.execute("SET max_memory = '512MB'")
            if read_only:
                try:
                    conn.execute("SET enable_external_access = false")
                except Exception as sec_exc:
                    logger.debug("DuckDB external access lockdown note: %s", sec_exc)
        except Exception as exc:
            logger.debug("DuckDB connection configuration: %s", exc)

    def create_connection(
        self,
        dataset_id: str,
        table_name: str = TABLE_NAME,
        read_only: bool = False,
        use_memory: bool = False,
    ) -> duckdb.DuckDBPyConnection:
        """Create or open a DuckDB database connection for dataset_id.

        Uses persistent file-backed database '{dataset_id}.duckdb' by default,
        or in-memory if use_memory=True or dataset_id == ':memory:'.
        """
        now = time.monotonic()
        with self._lock:
            # If connection is already open
            if dataset_id in self._connections:
                conn = self._connections[dataset_id]
                # If a read-write connection is requested but current connection is read-only, close and reopen
                if not read_only:
                    try:
                        # Test if writable
                        conn.execute("CREATE TABLE IF NOT EXISTS __rw_test (i INT)")
                        conn.execute("DROP TABLE __rw_test")
                    except Exception:
                        logger.info("Upgrading DuckDB connection %s from read-only to read-write", dataset_id)
                        try:
                            conn.close()
                        except Exception:
                            pass
                        self._connections.pop(dataset_id, None)

            if dataset_id in self._connections:
                if table_name and table_name not in self._table_names.get(dataset_id, []):
                    self._table_names.setdefault(dataset_id, []).append(table_name)
                self._last_active[dataset_id] = now
                return self._connections[dataset_id]

            # Establish new connection
            if use_memory or dataset_id == ":memory:":
                conn = duckdb.connect(database=":memory:", read_only=False)
            else:
                db_path = self.get_database_path(dataset_id)
                db_path.parent.mkdir(parents=True, exist_ok=True)
                conn = duckdb.connect(database=str(db_path), read_only=read_only)

            self._configure_connection(conn, read_only=read_only)
            self._connections[dataset_id] = conn
            if table_name:
                self._table_names[dataset_id] = [table_name]
            self._last_active[dataset_id] = now
            self._in_use[dataset_id] = 0

            # Enforce max cached connection limit via LRU eviction
            self._evict_lru_internal()
            return conn

    def transition_to_read_only(self, dataset_id: str) -> None:
        """Close read-write connection and transition to read-only mode after file upload.

        Ensures multiple worker processes can open and query the database concurrently without lock contention.
        """
        with self._lock:
            old_conn = self._connections.pop(dataset_id, None)
            if old_conn is not None:
                try:
                    old_conn.close()
                except Exception as exc:
                    logger.warning("Error closing write connection for %s during read-only transition: %s", dataset_id, exc)

            # Re-introspect persisted table names from the newly created database file
            db_path = self.get_database_path(dataset_id)
            if db_path.exists():
                try:
                    ro_conn = duckdb.connect(database=str(db_path), read_only=True)
                    self._configure_connection(ro_conn, read_only=True)
                    tables = [row[0] for row in ro_conn.execute("SHOW TABLES").fetchall()]
                    self._connections[dataset_id] = ro_conn
                    self._table_names[dataset_id] = tables
                    self._last_active[dataset_id] = time.monotonic()
                    self._in_use[dataset_id] = 0
                    logger.info("Transitioned dataset %s to persistent read-only mode with tables: %s", dataset_id, tables)
                except Exception as exc:
                    logger.warning("Failed to reopen dataset %s in read-only mode: %s", dataset_id, exc)

    def _introspect_tables(self, conn: duckdb.DuckDBPyConnection) -> list[str]:
        """Fetch all table and view names from an active DuckDB connection."""
        try:
            return [row[0] for row in conn.execute("SHOW TABLES").fetchall()]
        except Exception:
            return []

    def _try_auto_recover(self, dataset_id: str) -> duckdb.DuckDBPyConnection | None:
        """Restore DuckDB dataset from persistent .duckdb file, or raw upload files."""
        # 1. First check if persistent .duckdb file already exists
        db_path = self.get_database_path(dataset_id)
        if db_path.exists():
            try:
                conn = duckdb.connect(database=str(db_path), read_only=True)
                self._configure_connection(conn, read_only=True)
                tables = self._introspect_tables(conn)
                with self._lock:
                    self._connections[dataset_id] = conn
                    self._table_names[dataset_id] = tables
                    self._last_active[dataset_id] = time.monotonic()
                    self._in_use[dataset_id] = 0
                logger.info("Reopened persistent DuckDB file for dataset %s across worker with tables: %s", dataset_id, tables)
                return conn
            except Exception as exc:
                logger.warning("Failed to open existing DuckDB file for %s: %s", dataset_id, exc)

        # 2. Reconstruct from raw uploaded files if .duckdb file was deleted or legacy
        upload_dir = Path(settings.upload_dir)
        if not upload_dir.exists():
            return None

        prefix = f"{dataset_id}_"
        matching_files = [f for f in upload_dir.iterdir() if f.is_file() and f.name.startswith(prefix) and not f.name.endswith(".meta.json")]
        if not matching_files:
            return None

        from app.services.file_loader import file_loader

        conn = None
        for file_path in matching_files:
            original_name = file_path.name[len(prefix):]
            table_name = filename_to_table_name(original_name)

            if conn is None:
                conn = self.create_connection(dataset_id, table_name=table_name, read_only=False)
            else:
                with self._lock:
                    if table_name not in self._table_names.get(dataset_id, []):
                        self._table_names.setdefault(dataset_id, []).append(table_name)

            try:
                is_multi = len(matching_files) > 1
                file_loader.load(conn, file_path, original_name, create_alias=not is_multi)
            except Exception as exc:
                logger.warning("Error recovering table %s for dataset %s: %s", table_name, dataset_id, exc)

        if conn is not None:
            # Transition to read-only for concurrent worker sharing
            self.transition_to_read_only(dataset_id)
            return self._connections.get(dataset_id, conn)

        return None

    def get_connection(self, dataset_id: str, read_only: bool = True) -> duckdb.DuckDBPyConnection:
        """Get an active connection for dataset_id, opening persistent file if not cached."""
        now = time.monotonic()
        with self._lock:
            conn = self._connections.get(dataset_id)
            if conn is not None:
                self._last_active[dataset_id] = now
                return conn

        # Attempt recovery or loading from persistent .duckdb file
        recovered = self._try_auto_recover(dataset_id)
        if recovered is not None:
            return recovered

        raise KeyError(f"No active dataset found for id={dataset_id}")

    @contextmanager
    def acquire_connection(
        self, dataset_id: str, read_only: bool = True
    ) -> Generator[duckdb.DuckDBPyConnection, None, None]:
        """Context manager for query execution that tracks in-use status and prevents idle eviction."""
        conn = self.get_connection(dataset_id, read_only=read_only)
        with self._lock:
            self._in_use[dataset_id] = self._in_use.get(dataset_id, 0) + 1
            self._last_active[dataset_id] = time.monotonic()
        try:
            yield conn
        finally:
            with self._lock:
                self._in_use[dataset_id] = max(0, self._in_use.get(dataset_id, 1) - 1)
                self._last_active[dataset_id] = time.monotonic()

    def get_table_name(self, dataset_id: str) -> str:
        """Return the first table name for this dataset."""
        with self._lock:
            has_conn = dataset_id in self._connections

        if not has_conn:
            self._try_auto_recover(dataset_id)

        with self._lock:
            names = self._table_names.get(dataset_id, [self.TABLE_NAME])
            return names[0] if names else self.TABLE_NAME

    def get_table_names(self, dataset_id: str) -> list[str]:
        """Return all table names for this dataset."""
        with self._lock:
            has_conn = dataset_id in self._connections

        if not has_conn:
            self._try_auto_recover(dataset_id)

        with self._lock:
            return list(self._table_names.get(dataset_id, []))

    def drop_connection(self, dataset_id: str) -> None:
        """Idempotently close and remove a cached connection."""
        with self._lock:
            conn = self._connections.pop(dataset_id, None)
            self._table_names.pop(dataset_id, None)
            self._owners.pop(dataset_id, None)
            self._last_active.pop(dataset_id, None)
            self._in_use.pop(dataset_id, None)

        if conn is not None:
            try:
                conn.close()
            except Exception as exc:
                logger.warning("Error closing connection for dataset %s: %s", dataset_id, exc)

    def exists(self, dataset_id: str) -> bool:
        """Check if dataset exists in cache, as a persistent .duckdb file, or as raw upload files."""
        try:
            safe_id = validate_dataset_id(dataset_id)
        except ValueError:
            return False

        with self._lock:
            if safe_id in self._connections:
                return True

        db_path = self.get_database_path(safe_id)
        if db_path.exists():
            return True

        upload_dir = Path(settings.upload_dir)
        if upload_dir.exists():
            prefix = f"{safe_id}_"
            for f in upload_dir.iterdir():
                if f.is_file() and f.name.startswith(prefix) and not f.name.endswith(".meta.json"):
                    return True
        return False

    def cleanup_idle_connections(self, max_idle_seconds: float | None = None) -> int:
        """Close connections that have been idle for more than the configured timeout.

        Connections currently executing queries (in_use > 0) are never closed.
        """
        timeout = max_idle_seconds if max_idle_seconds is not None else self._idle_timeout
        now = time.monotonic()
        to_close: list[tuple[str, duckdb.DuckDBPyConnection]] = []

        with self._lock:
            for dataset_id, conn in list(self._connections.items()):
                idle_duration = now - self._last_active.get(dataset_id, now)
                in_use_count = self._in_use.get(dataset_id, 0)
                if idle_duration >= timeout and in_use_count == 0:
                    to_close.append((dataset_id, conn))
                    self._connections.pop(dataset_id, None)
                    self._table_names.pop(dataset_id, None)
                    self._owners.pop(dataset_id, None)
                    self._last_active.pop(dataset_id, None)
                    self._in_use.pop(dataset_id, None)

        for dataset_id, conn in to_close:
            try:
                conn.close()
                logger.info("Evicted idle DuckDB connection for dataset %s", dataset_id)
            except Exception as exc:
                logger.warning("Error closing evicted DuckDB connection for %s: %s", dataset_id, exc)

        return len(to_close)

    def _evict_lru_internal(self) -> int:
        """Evict oldest idle connections if cached count exceeds max_connections."""
        if len(self._connections) <= self._max_cached:
            return 0

        candidates = [
            (dataset_id, self._last_active.get(dataset_id, 0.0), self._connections[dataset_id])
            for dataset_id in self._connections
            if self._in_use.get(dataset_id, 0) == 0
        ]
        candidates.sort(key=lambda x: x[1])  # oldest first
        num_to_evict = len(self._connections) - self._max_cached
        to_evict = candidates[:num_to_evict]

        for dataset_id, _, _ in to_evict:
            self._connections.pop(dataset_id, None)
            self._table_names.pop(dataset_id, None)
            self._owners.pop(dataset_id, None)
            self._last_active.pop(dataset_id, None)
            self._in_use.pop(dataset_id, None)

        for dataset_id, _, conn in to_evict:
            try:
                conn.close()
                logger.info("Evicted LRU DuckDB connection for dataset %s", dataset_id)
            except Exception as exc:
                logger.warning("Error closing LRU connection for %s: %s", dataset_id, exc)

        return len(to_evict)

    def evict_lru_connections(self) -> int:
        """Public thread-safe LRU eviction."""
        with self._lock:
            return self._evict_lru_internal()

    def close_all_connections(self) -> int:
        """Close all connections on application shutdown."""
        with self._lock:
            all_conns = list(self._connections.items())
            self._connections.clear()
            self._table_names.clear()
            self._owners.clear()
            self._last_active.clear()
            self._in_use.clear()

        for dataset_id, conn in all_conns:
            try:
                conn.close()
            except Exception as exc:
                logger.warning("Error closing connection on shutdown for %s: %s", dataset_id, exc)

        return len(all_conns)

    async def start_periodic_cleanup(self, interval_seconds: float | None = None) -> None:
        """Periodic background task that runs for the worker lifespan."""
        interval = interval_seconds if interval_seconds is not None else float(settings.duckdb_cleanup_interval_seconds)
        while True:
            try:
                await asyncio.sleep(interval)
                evicted = self.cleanup_idle_connections()
                if evicted:
                    logger.info("Periodic DuckDB cleanup evicted %d connection(s)", evicted)
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.warning("Error in DuckDB cleanup worker: %s", exc)


# Singleton instance shared within the worker process
duckdb_manager = DuckDBManager()

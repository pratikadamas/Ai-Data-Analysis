"""Manages per-dataset DuckDB connections.

Each uploaded dataset gets its own in-memory (or on-disk) DuckDB database
keyed by a generated dataset_id, so datasets from different users/sessions
never collide and can be dropped independently.
"""
from __future__ import annotations

import re
import threading

import duckdb


def filename_to_table_name(filename: str) -> str:
    """Convert a filename like 'sales_2024.csv' -> 'sales_2024'."""
    stem = re.sub(r"\.[^.]+$", "", filename)          # strip extension
    stem = re.sub(r"[^A-Za-z0-9_]", "_", stem)       # replace unsafe chars
    stem = re.sub(r"_+", "_", stem).strip("_")        # collapse underscores
    if not stem or stem[0].isdigit():
        stem = "data_" + stem                          # ensure valid identifier
    return stem.lower()


class DuckDBManager:
    """Thread-safe registry of DuckDB connections keyed by dataset_id."""

    # Fallback / legacy constant kept for any code that imports it directly.
    TABLE_NAME = "uploaded_data"

    def __init__(self) -> None:
        self._connections: dict[str, duckdb.DuckDBPyConnection] = {}
        self._table_names: dict[str, list[str]] = {}    # dataset_id -> list of table names
        self._lock = threading.Lock()

    def create_connection(
        self, dataset_id: str, table_name: str = TABLE_NAME
    ) -> duckdb.DuckDBPyConnection:
        with self._lock:
            if dataset_id in self._connections:
                # Connection already exists; just add the table name if not present
                if table_name not in self._table_names[dataset_id]:
                    self._table_names[dataset_id].append(table_name)
                return self._connections[dataset_id]
            conn = duckdb.connect(database=":memory:")
            self._connections[dataset_id] = conn
            self._table_names[dataset_id] = [table_name]
            return conn

    def _try_auto_recover(self, dataset_id: str) -> duckdb.DuckDBPyConnection | None:
        """Attempt to restore DuckDB tables for dataset_id from saved upload files on disk."""
        from pathlib import Path
        from app.config import settings
        from app.services.file_loader import file_loader

        upload_dir = Path(settings.upload_dir)
        if not upload_dir.exists():
            return None

        prefix = f"{dataset_id}_"
        matching_files = [f for f in upload_dir.iterdir() if f.is_file() and f.name.startswith(prefix)]
        if not matching_files:
            return None

        conn = None
        for file_path in matching_files:
            original_name = file_path.name[len(prefix):]
            table_name = filename_to_table_name(original_name)

            if conn is None:
                conn = self.create_connection(dataset_id, table_name=table_name)
            else:
                with self._lock:
                    if table_name not in self._table_names.get(dataset_id, []):
                        self._table_names[dataset_id].append(table_name)

            try:
                is_multi = len(matching_files) > 1
                file_loader.load(conn, file_path, original_name, create_alias=not is_multi)
            except Exception:
                pass

        return conn

    def get_connection(self, dataset_id: str) -> duckdb.DuckDBPyConnection:
        conn = self._connections.get(dataset_id)
        if conn is not None:
            return conn

        # Attempt auto-recovery from disk files if backend restarted
        recovered = self._try_auto_recover(dataset_id)
        if recovered is not None:
            return recovered

        raise KeyError(f"No active dataset found for id={dataset_id}")

    def get_table_name(self, dataset_id: str) -> str:
        """Return the first DuckDB table name for this dataset (backward compat)."""
        if dataset_id not in self._connections:
            self._try_auto_recover(dataset_id)
        names = self._table_names.get(dataset_id, [self.TABLE_NAME])
        return names[0] if names else self.TABLE_NAME

    def get_table_names(self, dataset_id: str) -> list[str]:
        """Return all DuckDB table names for this dataset."""
        if dataset_id not in self._connections:
            self._try_auto_recover(dataset_id)
        return list(self._table_names.get(dataset_id, []))

    def drop_connection(self, dataset_id: str) -> None:
        with self._lock:
            conn = self._connections.pop(dataset_id, None)
            self._table_names.pop(dataset_id, None)
            if conn is not None:
                conn.close()

    def exists(self, dataset_id: str) -> bool:
        if dataset_id in self._connections:
            return True
        return self._try_auto_recover(dataset_id) is not None


# Singleton instance shared across the app (simple in-memory store).
duckdb_manager = DuckDBManager()

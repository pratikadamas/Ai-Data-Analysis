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
        self._table_names: dict[str, str] = {}          # dataset_id -> table name
        self._lock = threading.Lock()

    def create_connection(
        self, dataset_id: str, table_name: str = TABLE_NAME
    ) -> duckdb.DuckDBPyConnection:
        with self._lock:
            conn = duckdb.connect(database=":memory:")
            self._connections[dataset_id] = conn
            self._table_names[dataset_id] = table_name
            return conn

    def get_connection(self, dataset_id: str) -> duckdb.DuckDBPyConnection:
        conn = self._connections.get(dataset_id)
        if conn is None:
            raise KeyError(f"No active dataset found for id={dataset_id}")
        return conn

    def get_table_name(self, dataset_id: str) -> str:
        """Return the DuckDB table name for this dataset (defaults to 'uploaded_data')."""
        return self._table_names.get(dataset_id, self.TABLE_NAME)

    def drop_connection(self, dataset_id: str) -> None:
        with self._lock:
            conn = self._connections.pop(dataset_id, None)
            self._table_names.pop(dataset_id, None)
            if conn is not None:
                conn.close()

    def exists(self, dataset_id: str) -> bool:
        return dataset_id in self._connections


# Singleton instance shared across the app (simple in-memory store).
# In production, back this with a proper session/cache layer (e.g. Redis
# tracking file paths + TTL, with DuckDB opened on demand).
duckdb_manager = DuckDBManager()

"""Loads uploaded files of various formats into a DuckDB table.

Every loader creates the table using the sanitized filename as the table name
(e.g. 'sales_2024' for 'sales_2024.csv') so the LLM and users can reference
it naturally. A view called 'uploaded_data' is also created as a backward-
compatible alias so any hardcoded references keep working.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path

import duckdb
import pandas as pd

from app.db.duckdb_manager import filename_to_table_name
from app.utils.file_utils import detect_file_type


class UnsupportedFileError(Exception):
    pass


class FileLoader:
    """Dispatches to the correct loader based on detected file type."""

    def load(
        self,
        conn: duckdb.DuckDBPyConnection,
        file_path: Path,
        filename: str,
        create_alias: bool = True,
    ) -> str:
        """Load *file_path* into *conn* and return the table name used."""
        file_type = detect_file_type(filename)
        table_name = filename_to_table_name(filename)

        loader = {
            "csv": self._load_csv,
            "excel": self._load_excel,
            "sqlite": self._load_sqlite,
            "sql_dump": self._load_sql_dump,
        }.get(file_type)

        if loader is None:
            raise UnsupportedFileError(f"No loader registered for file type: {file_type}")

        loader(conn, file_path, table_name)

        # Create a backward-compatible alias view named 'uploaded_data'.
        if create_alias and table_name != "uploaded_data":
            try:
                conn.execute(f'CREATE OR REPLACE VIEW uploaded_data AS SELECT * FROM "{table_name}"')
            except Exception:
                pass  # Ignore if already exists from another file

        return table_name

    # ------------------------------------------------------------------
    # Private loaders — each accepts the target table_name
    # ------------------------------------------------------------------

    def _load_csv(
        self, conn: duckdb.DuckDBPyConnection, file_path: Path, table_name: str
    ) -> None:
        conn.execute(
            f"""
            CREATE TABLE "{table_name}" AS
            SELECT * FROM read_csv_auto(?, sample_size=-1)
            """,
            [str(file_path)],
        )

    def _load_excel(
        self, conn: duckdb.DuckDBPyConnection, file_path: Path, table_name: str
    ) -> None:
        try:
            df = pd.read_excel(file_path, sheet_name=0)
        except Exception:
            # Fallback for alternative excel engines or legacy files
            df = pd.read_excel(file_path)
            
        # Clean column names (strip whitespace, ensure string, fill unnamed)
        cleaned_cols = []
        for i, col in enumerate(df.columns):
            c_str = str(col).strip() if col is not None else ""
            if not c_str or c_str.startswith("Unnamed:"):
                cleaned_cols.append(f"column_{i+1}")
            else:
                cleaned_cols.append(c_str)
        df.columns = cleaned_cols

        conn.register("tmp_df", df)
        conn.execute(f'CREATE TABLE "{table_name}" AS SELECT * FROM tmp_df')
        conn.unregister("tmp_df")

    def _load_sqlite(
        self, conn: duckdb.DuckDBPyConnection, file_path: Path, table_name: str
    ) -> None:
        sqlite_conn = sqlite3.connect(str(file_path))
        try:
            cursor = sqlite_conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
            tables = [row[0] for row in cursor.fetchall()]
            if not tables:
                raise UnsupportedFileError("No tables found in SQLite database")
            df = pd.read_sql_query(f"SELECT * FROM {tables[0]}", sqlite_conn)
        finally:
            sqlite_conn.close()

        conn.register("tmp_df", df)
        conn.execute(f'CREATE TABLE "{table_name}" AS SELECT * FROM tmp_df')
        conn.unregister("tmp_df")

    def _load_sql_dump(
        self, conn: duckdb.DuckDBPyConnection, file_path: Path, table_name: str
    ) -> None:
        sql_text = file_path.read_text(encoding="utf-8", errors="ignore")
        sqlite_conn = sqlite3.connect(":memory:")
        try:
            sqlite_conn.executescript(sql_text)
            cursor = sqlite_conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
            tables = [row[0] for row in cursor.fetchall()]
            if not tables:
                raise UnsupportedFileError("SQL dump did not create any tables")
            df = pd.read_sql_query(f"SELECT * FROM {tables[0]}", sqlite_conn)
        finally:
            sqlite_conn.close()

        conn.register("tmp_df", df)
        conn.execute(f'CREATE TABLE "{table_name}" AS SELECT * FROM tmp_df')
        conn.unregister("tmp_df")


file_loader = FileLoader()

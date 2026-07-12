"""Extracts and caches schema information for a loaded DuckDB table."""
from __future__ import annotations

# pyrefly: ignore [missing-import]
import duckdb

# pyrefly: ignore [missing-import]
from app.db.duckdb_manager import DuckDBManager, duckdb_manager
# pyrefly: ignore [missing-import]
from app.models.schemas import ColumnSchema, DatasetSchema

_NUMERIC_TYPES = {
    "TINYINT", "SMALLINT", "INTEGER", "BIGINT", "HUGEINT",
    "FLOAT", "DOUBLE", "DECIMAL", "REAL",
}
_DATETIME_TYPES = {"DATE", "TIME", "TIMESTAMP", "TIMESTAMP WITH TIME ZONE"}

# Simple in-process cache: dataset_id -> DatasetSchema.
_schema_cache: dict[str, DatasetSchema] = {}


def extract_schema(conn: duckdb.DuckDBPyConnection, dataset_id: str) -> DatasetSchema:
    """Introspect the uploaded_data table and build a DatasetSchema.

    Results are cached per dataset_id since the underlying table is
    immutable after upload.
    """
    if dataset_id in _schema_cache:
        return _schema_cache[dataset_id]

    table = duckdb_manager.get_table_name(dataset_id)
    describe_rows = conn.execute(f'DESCRIBE "{table}"').fetchall()
    row_count = conn.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]

    columns: list[ColumnSchema] = []
    for col_name, col_type, *_rest in describe_rows:
        base_type = col_type.split("(")[0].upper()
        missing = conn.execute(
            f'SELECT COUNT(*) FROM "{table}" WHERE "{col_name}" IS NULL'
        ).fetchone()[0]
        distinct = conn.execute(
            f'SELECT COUNT(DISTINCT "{col_name}") FROM "{table}"'
        ).fetchone()[0]

        is_numeric = base_type in _NUMERIC_TYPES
        is_datetime = base_type in _DATETIME_TYPES
        is_categorical = (not is_numeric) and (not is_datetime) and (
            row_count == 0 or distinct / max(row_count, 1) < 0.5
        )

        columns.append(
            ColumnSchema(
                name=col_name,
                dtype=col_type,
                missing_count=missing,
                is_numeric=is_numeric,
                is_datetime=is_datetime,
                is_categorical=is_categorical,
            )
        )

    col_list = ", ".join(f'"{c.name}"' for c in columns)
    duplicate_count = conn.execute(
        f"""
        SELECT COUNT(*) - COUNT(*) FILTER (WHERE rn = 1) FROM (
            SELECT ROW_NUMBER() OVER (PARTITION BY {col_list}) AS rn
            FROM "{table}"
        ) t
        """
    ).fetchone()[0]

    schema = DatasetSchema(
        dataset_id=dataset_id,
        table_name=table,
        row_count=row_count,
        column_count=len(columns),
        columns=columns,
        duplicate_row_count=max(duplicate_count, 0),
    )
    _schema_cache[dataset_id] = schema
    return schema


def invalidate_schema_cache(dataset_id: str) -> None:
    _schema_cache.pop(dataset_id, None)


def schema_to_llm_prompt(schema: DatasetSchema) -> str:
    """Render the schema as a compact text block for the LLM's system prompt."""
    lines = [f"Table Name: {schema.table_name}", "Columns:"]
    for col in schema.columns:
        lines.append(f"  {col.name} {col.dtype}")
    return "\n".join(lines)

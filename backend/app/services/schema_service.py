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

_schema_cache: dict[str, DatasetSchema] = {}


def extract_table_schema(conn: duckdb.DuckDBPyConnection, dataset_id: str, table_name: str) -> DatasetSchema:
    """Introspect a specific DuckDB table and build a DatasetSchema."""
    cache_key = f"{dataset_id}:{table_name}"
    if cache_key in _schema_cache:
        return _schema_cache[cache_key]

    describe_rows = conn.execute(f'DESCRIBE "{table_name}"').fetchall()
    row_count = conn.execute(f'SELECT COUNT(*) FROM "{table_name}"').fetchone()[0]

    columns: list[ColumnSchema] = []
    for col_name, col_type, *_rest in describe_rows:
        base_type = col_type.split("(")[0].upper()
        missing = conn.execute(
            f'SELECT COUNT(*) FROM "{table_name}" WHERE "{col_name}" IS NULL'
        ).fetchone()[0]
        distinct = conn.execute(
            f'SELECT COUNT(DISTINCT "{col_name}") FROM "{table_name}"'
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

    col_list = ", ".join(f'"{c.name}"' for c in columns) if columns else ""
    duplicate_count = 0
    if col_list:
        try:
            duplicate_count = conn.execute(
                f"""
                SELECT COUNT(*) - COUNT(*) FILTER (WHERE rn = 1) FROM (
                    SELECT ROW_NUMBER() OVER (PARTITION BY {col_list}) AS rn
                    FROM "{table_name}"
                ) t
                """
            ).fetchone()[0]
        except Exception:
            duplicate_count = 0

    schema = DatasetSchema(
        dataset_id=dataset_id,
        table_name=table_name,
        row_count=row_count,
        column_count=len(columns),
        columns=columns,
        duplicate_row_count=max(duplicate_count, 0),
    )
    _schema_cache[cache_key] = schema
    return schema


def extract_schema(conn: duckdb.DuckDBPyConnection, dataset_id: str, table_name: str | None = None) -> DatasetSchema:
    """Introspect a table and build a DatasetSchema (defaults to first table)."""
    if not table_name:
        table_name = duckdb_manager.get_table_name(dataset_id)
    return extract_table_schema(conn, dataset_id, table_name)


def extract_all_schemas(conn: duckdb.DuckDBPyConnection, dataset_id: str) -> list[DatasetSchema]:
    """Introspect all tables for this dataset_id and return a list of DatasetSchema objects."""
    table_names = duckdb_manager.get_table_names(dataset_id)
    if not table_names:
        # Fallback to first table if none registered
        table_names = [duckdb_manager.get_table_name(dataset_id)]
    return [extract_table_schema(conn, dataset_id, t) for t in table_names]


def invalidate_schema_cache(dataset_id: str) -> None:
    keys_to_del = [k for k in _schema_cache if k == dataset_id or k.startswith(f"{dataset_id}:")]
    for k in keys_to_del:
        _schema_cache.pop(k, None)


def schema_to_llm_prompt(schema: DatasetSchema) -> str:
    """Render a single schema as a compact text block for the LLM's system prompt."""
    lines = [f"Table Name: \"{schema.table_name}\"", "Columns:"]
    for col in schema.columns:
        lines.append(f"  {col.name} {col.dtype}")
    return "\n".join(lines)


def all_schemas_to_llm_prompt(schemas: list[DatasetSchema], target_table: str | None = None) -> str:
    """Render all schemas in the dataset for LLM prompt context."""
    blocks = []
    if target_table:
        blocks.append(f"User selected target dataset table: \"{target_table}\"")
    blocks.append("Available Database Schemas:")
    for s in schemas:
        blocks.append(schema_to_llm_prompt(s))
    return "\n\n".join(blocks)


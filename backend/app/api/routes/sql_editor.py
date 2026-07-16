"""SQL Editor endpoint: run user-written SQL queries against uploaded datasets."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db.duckdb_manager import duckdb_manager
from app.models.schemas import SqlQueryRequest, SqlQueryResponse
from app.validation.sql_validator import SQLValidationError, validate_sql

router = APIRouter(prefix="/api/sql-editor", tags=["sql-editor"])


@router.post("", response_model=SqlQueryResponse)
async def run_sql_query(req: SqlQueryRequest) -> SqlQueryResponse:
    try:
        conn = duckdb_manager.get_connection(req.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc

    # Validate the SQL is read-only
    try:
        safe_sql = validate_sql(req.sql)
    except SQLValidationError as exc:
        return SqlQueryResponse(
            sql=req.sql,
            error=str(exc),
        )

    # Execute the query
    try:
        df = conn.execute(safe_sql).fetch_df()
    except Exception as exc:  # noqa: BLE001
        return SqlQueryResponse(
            sql=safe_sql,
            error=f"Query execution failed: {exc}",
        )

    columns = list(df.columns)
    rows = df.head(500).to_dict(orient="records")

    return SqlQueryResponse(
        sql=safe_sql,
        columns=columns,
        rows=rows,
    )


@router.get("/{dataset_id}/tables")
async def list_tables(dataset_id: str) -> dict:
    if not duckdb_manager.exists(dataset_id):
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    table_names = duckdb_manager.get_table_names(dataset_id)
    return {"dataset_id": dataset_id, "tables": table_names}

"""Manual "Explore" mode endpoint: user picks columns/aggregation/chart type
directly, we build and run a safe aggregate query.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db.duckdb_manager import duckdb_manager
from app.models.schemas import ExploreRequest
from app.services.chart_service import build_chart_spec

router = APIRouter(prefix="/api/explore", tags=["explore"])

_AGG_SQL = {
    "sum": "SUM",
    "avg": "AVG",
    "count": "COUNT",
    "min": "MIN",
    "max": "MAX",
}


@router.post("")
async def explore(req: ExploreRequest) -> dict:
    try:
        conn = duckdb_manager.get_connection(req.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc

    # Use specified table_name or fall back to default (first table)
    if req.table_name:
        # Validate that the requested table exists in this dataset
        available_tables = duckdb_manager.get_table_names(req.dataset_id)
        if req.table_name not in available_tables:
            raise HTTPException(status_code=400, detail=f"Unknown table: {req.table_name}")
        target_table = req.table_name
    else:
        target_table = duckdb_manager.get_table_name(req.dataset_id)

    # Get columns for the specific target table
    describe_rows = conn.execute(f'DESCRIBE "{target_table}"').fetchall()
    valid_columns = {row[0] for row in describe_rows}

    if req.x_column not in valid_columns:
        raise HTTPException(status_code=400, detail=f"Unknown column: {req.x_column}")
    if req.y_column and req.y_column not in valid_columns:
        raise HTTPException(status_code=400, detail=f"Unknown column: {req.y_column}")

    table = f'"{target_table}"'

    if req.aggregation != "none" and req.y_column:
        agg_fn = _AGG_SQL[req.aggregation]
        sql = (
            f'SELECT "{req.x_column}", {agg_fn}("{req.y_column}") AS "{req.y_column}" '
            f'FROM {table} GROUP BY "{req.x_column}" ORDER BY 2 DESC LIMIT 500'
        )
    elif req.y_column:
        sql = f'SELECT "{req.x_column}", "{req.y_column}" FROM {table} LIMIT 500'
    else:
        sql = f'SELECT "{req.x_column}", COUNT(*) AS count FROM {table} GROUP BY "{req.x_column}" LIMIT 500'

    try:
        df = conn.execute(sql).fetch_df()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Query failed: {exc}") from exc

    rows = df.to_dict(orient="records")
    chart_spec = build_chart_spec(req.chart_type, list(df.columns), rows)

    return {
        "sql": sql,
        "columns": list(df.columns),
        "rows": rows,
        "chart_type": req.chart_type,
        "chart_spec": chart_spec,
    }

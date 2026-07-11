"""Download endpoints for exporting query results.

The client sends back the SQL it wants exported (already validated once
by /api/chat or /api/explore) plus the target format; we re-validate,
re-run, and stream the result back as a file.
"""
from __future__ import annotations

import io

import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.db.duckdb_manager import duckdb_manager
from app.validation.sql_validator import SQLValidationError, validate_sql

router = APIRouter(prefix="/api/download", tags=["download"])


class DownloadRequest(BaseModel):
    dataset_id: str
    sql: str


@router.post("/csv")
async def download_csv(req: DownloadRequest) -> StreamingResponse:
    df = _run_query(req)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=result.csv"},
    )


@router.post("/excel")
async def download_excel(req: DownloadRequest) -> StreamingResponse:
    df = _run_query(req)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Result")
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=result.xlsx"},
    )


def _run_query(req: DownloadRequest) -> pd.DataFrame:
    try:
        conn = duckdb_manager.get_connection(req.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc

    try:
        safe_sql = validate_sql(req.sql)
    except SQLValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        return conn.execute(safe_sql).fetch_df()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Query failed: {exc}") from exc

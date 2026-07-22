"""Dataset lifecycle endpoints: fetch schema again, and delete/cleanup."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Response

from app.db.duckdb_manager import duckdb_manager
from app.models.schemas import DatasetSchema
from app.services.schema_service import extract_schema, invalidate_schema_cache

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.get("/{dataset_id}/schema", response_model=DatasetSchema)
async def get_schema(dataset_id: str) -> DatasetSchema:
    try:
        conn = duckdb_manager.get_connection(dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc
    return extract_schema(conn, dataset_id)


@router.get("/{dataset_id}/preview")
async def get_preview(dataset_id: str) -> dict[str, list[dict[str, Any]]]:
    """Return the first 100 rows for every table in this dataset.

    Used by the frontend to restore preview data after a page refresh
    without bloating sessionStorage. Shape: { table_name: [row, ...] }
    """
    try:
        conn = duckdb_manager.get_connection(dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc

    table_names = duckdb_manager.get_table_names(dataset_id)
    result: dict[str, list[dict[str, Any]]] = {}
    for table_name in table_names:
        rows = (
            conn.execute(f'SELECT * FROM "{table_name}" LIMIT 100')
            .fetch_df()
            .to_dict(orient="records")
        )
        result[table_name] = rows
    return result


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str) -> dict:
    if not duckdb_manager.exists(dataset_id):
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    duckdb_manager.drop_connection(dataset_id)
    invalidate_schema_cache(dataset_id)
    return {"status": "deleted", "dataset_id": dataset_id}


@router.post("/{dataset_id}/cleanup", status_code=204)
async def cleanup_dataset(dataset_id: str) -> Response:
    """Fire-and-forget cleanup called via navigator.sendBeacon() on tab close.

    Returns 204 No Content so the browser does not need to read the response body.
    Silently ignores unknown dataset_ids (beacon may arrive after a server restart).
    """
    if duckdb_manager.exists(dataset_id):
        duckdb_manager.drop_connection(dataset_id)
        invalidate_schema_cache(dataset_id)
    return Response(status_code=204)

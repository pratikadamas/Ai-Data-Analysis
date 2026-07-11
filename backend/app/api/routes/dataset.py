"""Dataset lifecycle endpoints: fetch schema again, and delete/cleanup."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

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


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str) -> dict:
    if not duckdb_manager.exists(dataset_id):
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    duckdb_manager.drop_connection(dataset_id)
    invalidate_schema_cache(dataset_id)
    return {"status": "deleted", "dataset_id": dataset_id}

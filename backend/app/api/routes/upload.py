"""Upload endpoint: accepts a file, loads it into DuckDB, and returns
schema + preview information.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

logger = logging.getLogger(__name__)

from app.config import settings
from app.db.duckdb_manager import duckdb_manager, filename_to_table_name
from app.models.schemas import DatasetSchema, UploadResponse
from app.services.file_loader import UnsupportedFileError, file_loader
from app.services.schema_service import extract_schema
from app.utils.file_utils import (
    is_allowed_extension,
    new_dataset_id,
    sanitize_filename,
    upload_path_for,
)

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    if not is_allowed_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. Allowed: "
                f"{', '.join(settings.allowed_extensions)}"
            ),
        )

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f}MB). Limit is {settings.max_upload_mb}MB.",
        )

    dataset_id = new_dataset_id()
    safe_name = sanitize_filename(file.filename)
    dest_path = upload_path_for(dataset_id, safe_name)
    table_name = filename_to_table_name(safe_name)

    try:
        dest_path.write_bytes(contents)

        conn = duckdb_manager.create_connection(dataset_id, table_name=table_name)
        file_loader.load(conn, dest_path, safe_name)
        schema: DatasetSchema = extract_schema(conn, dataset_id)

        preview_rows = conn.execute(
            f'SELECT * FROM "{table_name}" LIMIT 100'
        ).fetch_df().to_dict(orient="records")

    except UnsupportedFileError as exc:
        duckdb_manager.drop_connection(dataset_id)
        logger.warning("Unsupported file: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surfaced as a clean 400 to the client
        duckdb_manager.drop_connection(dataset_id)
        logger.exception("File processing failed for %s: %s", safe_name, exc)
        raise HTTPException(status_code=400, detail=f"Failed to process file: {exc}") from exc
    finally:
        # Delete the temp file from disk once loaded into DuckDB (data now
        # lives in the in-memory connection for this session).
        if dest_path.exists():
            dest_path.unlink(missing_ok=True)

    return UploadResponse(
        dataset_id=dataset_id,
        filename=safe_name,
        file_type=safe_name.split(".")[-1],
        **{"schema": schema},
        preview_rows=preview_rows,
    )

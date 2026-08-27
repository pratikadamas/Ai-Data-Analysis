"""Upload endpoint: accepts one or more files (max 10), loads them into
DuckDB as separate tables, and returns schema + preview for each.
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

logger = logging.getLogger(__name__)

from app.config import settings
from app.db.duckdb_manager import duckdb_manager, filename_to_table_name
from app.models.schemas import DatasetSchema, FileInfo, UploadResponse
from app.services.file_loader import UnsupportedFileError, file_loader
from app.services.schema_service import extract_table_schema
from app.utils.file_utils import (
    is_allowed_extension,
    new_dataset_id,
    sanitize_filename,
    upload_path_for,
)

MAX_FILES = 10

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("", response_model=UploadResponse)
async def upload_dataset(
    files: List[UploadFile] = File(...),
    dataset_id: Optional[str] = Form(None),
) -> UploadResponse:
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum {MAX_FILES} files allowed per upload.",
        )

    if not dataset_id or not duckdb_manager.exists(dataset_id):
        dataset_id = new_dataset_id()

    file_infos: list[FileInfo] = []
    conn = None

    for idx, file in enumerate(files):
        if not file.filename:
            raise HTTPException(status_code=400, detail=f"File #{idx + 1} has no filename.")

        if not is_allowed_extension(file.filename):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file type for '{file.filename}'. Allowed: "
                    f"{', '.join(settings.allowed_extensions)}"
                ),
            )

        contents = await file.read()
        size_mb = len(contents) / (1024 * 1024)
        if size_mb > settings.max_upload_mb:
            raise HTTPException(
                status_code=413,
                detail=f"File '{file.filename}' too large ({size_mb:.1f}MB). Limit is {settings.max_upload_mb}MB.",
            )

        safe_name = sanitize_filename(file.filename)
        dest_path = upload_path_for(dataset_id, safe_name)
        base_table_name = filename_to_table_name(safe_name)
        table_name = base_table_name

        existing_tables = duckdb_manager.get_table_names(dataset_id)
        if table_name in existing_tables:
            counter = 2
            while f"{base_table_name}_{counter}" in existing_tables:
                counter += 1
            table_name = f"{base_table_name}_{counter}"

        try:
            dest_path.write_bytes(contents)

            conn = duckdb_manager.create_connection(dataset_id, table_name=table_name)
            is_multi = len(files) > 1 or len(existing_tables) > 0
            file_loader.load(conn, dest_path, safe_name, create_alias=not is_multi)

            schema: DatasetSchema = extract_table_schema(conn, dataset_id, table_name)

            preview_rows = conn.execute(
                f'SELECT * FROM "{table_name}" LIMIT 100'
            ).fetch_df().to_dict(orient="records")

            file_infos.append(
                FileInfo(
                    filename=safe_name,
                    file_type=safe_name.split(".")[-1],
                    table_name=table_name,
                    **{"schema": schema},
                    preview_rows=preview_rows,
                )
            )

        except UnsupportedFileError as exc:
            logger.warning("Unsupported file: %s", exc)
            if len(files) == 1:
                if len(duckdb_manager.get_table_names(dataset_id)) == 0:
                    duckdb_manager.drop_connection(dataset_id)
                raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception as exc:  # noqa: BLE001 - surfaced as a clean 400 to the client
            logger.exception("File processing failed for %s: %s", safe_name, exc)
            if len(files) == 1:
                if len(duckdb_manager.get_table_names(dataset_id)) == 0:
                    duckdb_manager.drop_connection(dataset_id)
                raise HTTPException(status_code=400, detail=f"Failed to process file '{safe_name}': {exc}") from exc
        finally:
            # Delete the temp file from disk once loaded into DuckDB
            if dest_path.exists():
                dest_path.unlink(missing_ok=True)

    if not file_infos:
        if len(duckdb_manager.get_table_names(dataset_id)) == 0:
            duckdb_manager.drop_connection(dataset_id)
        raise HTTPException(status_code=400, detail="Failed to process uploaded files. Please verify file formats.")

    return UploadResponse(
        dataset_id=dataset_id,
        files=file_infos,
    )


def _extract_table_schema(conn, dataset_id: str, table_name: str) -> DatasetSchema:
    """Extract schema for a specific table within the connection."""
    from app.models.schemas import ColumnSchema

    _NUMERIC_TYPES = {
        "TINYINT", "SMALLINT", "INTEGER", "BIGINT", "HUGEINT",
        "FLOAT", "DOUBLE", "DECIMAL", "REAL",
    }
    _DATETIME_TYPES = {"DATE", "TIME", "TIMESTAMP", "TIMESTAMP WITH TIME ZONE"}

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

    return DatasetSchema(
        dataset_id=dataset_id,
        table_name=table_name,
        row_count=row_count,
        column_count=len(columns),
        columns=columns,
        duplicate_row_count=0,
    )

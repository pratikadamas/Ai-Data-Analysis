"""Small filesystem/file-naming helpers."""
from __future__ import annotations

import re
import uuid
from pathlib import Path

# pyrefly: ignore [missing-import]
from app.config import settings

_SAFE_CHARS = re.compile(r"[^A-Za-z0-9._-]")


def sanitize_filename(filename: str) -> str:
    """Strip path components and unsafe characters from a client-supplied filename."""
    name = Path(filename).name
    name = _SAFE_CHARS.sub("_", name)
    return name or "upload"


def detect_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    mapping = {
        ".csv": "csv",
        ".xlsx": "excel",
        ".xls": "excel",
        ".db": "sqlite",
        ".sqlite": "sqlite",
        ".sql": "sql_dump",
    }
    if ext not in mapping:
        raise ValueError(f"Unsupported file extension: {ext}")
    return mapping[ext]


def is_allowed_extension(filename: str) -> bool:
    return Path(filename).suffix.lower() in settings.allowed_extensions


def new_dataset_id() -> str:
    return uuid.uuid4().hex[:12]


def upload_path_for(dataset_id: str, filename: str) -> Path:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir / f"{dataset_id}_{sanitize_filename(filename)}"

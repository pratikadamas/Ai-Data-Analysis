"""Application configuration loaded from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "200"))
    upload_dir: str = os.getenv("UPLOAD_DIR", "./uploads")
    cors_origins: list[str] = field(
        default_factory=lambda: os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    )
    allowed_extensions: tuple[str, ...] = (".csv", ".xlsx", ".xls", ".db", ".sqlite", ".sql")


settings = Settings()

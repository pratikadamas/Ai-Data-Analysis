"""Application configuration loaded from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Resolve backend root (one level up from this app directory)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent


@dataclass
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "200"))
    # Resolve upload_dir; if it's absolute (like /tmp), use it directly, otherwise make it relative to backend root
    upload_dir: str = field(
        default_factory=lambda: str(
            Path(os.getenv("UPLOAD_DIR", "uploads")).resolve() if Path(os.getenv("UPLOAD_DIR", "uploads")).is_absolute() 
            else (_BACKEND_ROOT / os.getenv("UPLOAD_DIR", "uploads").lstrip("./")).resolve()
        )
    )
    cors_origins: list[str] = field(
        default_factory=lambda: os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    )
    allowed_extensions: tuple[str, ...] = (".csv", ".xlsx", ".xls", ".db", ".sqlite", ".sql")

    # MongoDB Config
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    database_name: str = os.getenv("DATABASE_NAME", "eduassist")

    # JWT Config
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Mail Config (SMTP)
    mail_username: str = os.getenv("MAIL_USERNAME", "")
    mail_password: str = os.getenv("MAIL_PASSWORD", "")
    mail_from: str = os.getenv("MAIL_FROM", "")
    mail_port: int = int(os.getenv("MAIL_PORT", "587"))
    mail_server: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_starttls: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    mail_ssl_tls: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"


settings = Settings()

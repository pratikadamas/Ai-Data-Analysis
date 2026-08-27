"""Firebase Admin SDK initializer — used to verify Google OAuth ID tokens on the backend."""
from __future__ import annotations

import logging

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from app.config import settings

logger = logging.getLogger(__name__)

_initialized = False


def _init_firebase() -> None:
    """Lazily initialize the Firebase Admin app exactly once."""
    global _initialized
    if _initialized or firebase_admin._apps:
        _initialized = True
        return

    if not settings.firebase_project_id or not settings.firebase_client_email or not settings.firebase_private_key:
        logger.warning(
            "Firebase Admin SDK credentials are missing. "
            "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in backend/.env"
        )
        return

    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "client_email": settings.firebase_client_email,
        "private_key": settings.firebase_private_key,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred)
    _initialized = True
    logger.info("Firebase Admin SDK initialized successfully.")


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.

    Returns a dict with at minimum:
        uid      – Firebase user ID
        email    – verified email address
        name     – display name (may be empty string)
        picture  – profile photo URL (may be empty string)

    Raises:
        ValueError  – if the token is invalid or credentials are not configured.
    """
    _init_firebase()

    if not firebase_admin._apps:
        raise ValueError(
            "Firebase Admin SDK is not initialized. "
            "Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env"
        )

    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as exc:
        logger.warning("Firebase token verification failed: %s", exc)
        raise ValueError(f"Invalid or expired Firebase ID token: {exc}") from exc

    return {
        "uid": decoded.get("uid") or decoded.get("sub", ""),
        "email": decoded.get("email", ""),
        "name": decoded.get("name", ""),
        "picture": decoded.get("picture", ""),
        "email_verified": decoded.get("email_verified", False),
    }

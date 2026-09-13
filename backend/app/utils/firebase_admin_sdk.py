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

    Supports two verification strategies:
      1. Firebase Admin SDK (if service account credentials are set in .env).
      2. Direct Google public certificate verification via google-auth (zero private-key setup required).

    Returns a dict with at minimum:
        uid      – Firebase user ID
        email    – verified email address
        name     – display name (may be empty string)
        picture  – profile photo URL (may be empty string)
        email_verified – bool

    Raises:
        ValueError  – if the token is invalid or expired.
    """
    # ── Strategy 1: Firebase Admin SDK (if credentials exist) ────────────────
    _init_firebase()
    if firebase_admin._apps:
        try:
            decoded = firebase_auth.verify_id_token(id_token)
            return {
                "uid": decoded.get("uid") or decoded.get("sub", ""),
                "email": decoded.get("email", ""),
                "name": decoded.get("name", ""),
                "picture": decoded.get("picture", ""),
                "email_verified": decoded.get("email_verified", False),
            }
        except Exception as exc:
            logger.warning("Firebase Admin SDK verify failed, falling back to public cert verification: %s", exc)

    # ── Strategy 2: Google Public Key Token Verification (no service account required) ──
    project_id = settings.firebase_project_id or "ai-data-analysis-ea825"
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        req = google_requests.Request()
        decoded = google_id_token.verify_firebase_token(id_token, req, audience=project_id)
        if not decoded:
            raise ValueError("Token verification returned empty claims.")

        return {
            "uid": decoded.get("sub") or decoded.get("uid", ""),
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "picture": decoded.get("picture", ""),
            "email_verified": decoded.get("email_verified", False),
        }
    except Exception as exc:
        logger.error("Failed to verify Firebase ID token: %s", exc)
        raise ValueError(f"Invalid or expired Google/Firebase ID token: {exc}") from exc

"""MongoDB-backed sliding window rate limiter and OTP failure lockout.

Uses the existing MongoDB connection (no new dependencies) so rate-limit state
is:
  • Persistent across server restarts
  • Shared across all Uvicorn/Gunicorn worker processes
  • Consistent in multi-instance / cloud deployments (Render, Vercel, etc.)

The `rate_limits` collection stores one document per (key, window_start) pair
and uses a TTL index to auto-expire old records — no manual cleanup needed.

Collection schema per rate_limits document:
  {
    "key":          "ip:1.2.3.4" | "user:email@example.com",
    "window_start": <datetime — truncated to current window>,
    "count":        <int — number of attempts in this window>,
    "expires_at":   <datetime — window_start + window_seconds, used by TTL index>
  }

The `otp_lockouts` collection stores one document per email address and tracks
consecutive OTP verification failures. After MAX_OTP_FAILURES consecutive wrong
OTPs the account is locked until the document's TTL expires.

Collection schema per otp_lockouts document:
  {
    "email":      <str — lowercase email address>,
    "failures":   <int — consecutive failed OTP attempts>,
    "locked":     <bool — True once failure limit is reached>,
    "expires_at": <datetime — auto-cleared by MongoDB TTL index>
  }
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


class MongoRateLimiter:
    """Sliding-window rate limiter backed by MongoDB.

    Parameters
    ----------
    max_requests : int
        Maximum number of requests allowed per window.
    window_seconds : int
        Duration of the sliding window in seconds.
    """

    def __init__(
        self,
        max_requests: int = 5,
        window_seconds: int = 60,
        custom_detail: str | None = None,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.custom_detail = custom_detail
        self._col = None   # lazy-loaded to avoid import-time circular issues

    def _get_col(self):
        """Lazy-load the MongoDB collection and ensure the TTL index exists."""
        if self._col is not None:
            return self._col
        # Deferred import — mongodb.py may not be fully initialized at import time
        from app.db.mongodb import db  # noqa: PLC0415
        col = db["rate_limits"]
        # TTL index: MongoDB automatically removes expired documents.
        # expireAfterSeconds=0 means "expire at the datetime stored in expires_at".
        try:
            col.create_index("expires_at", expireAfterSeconds=0, background=True)
            col.create_index([("key", 1), ("window_start", 1)], background=True)
        except Exception as exc:
            logger.warning("Rate limiter: could not create indexes: %s", exc)
        self._col = col
        return col

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    def check_rate_limit(self, ip: str | None = None, username: str | None = None) -> None:
        """Check sliding-window rate limits for both IP and username.

        Raises HTTP 429 if the limit is exceeded for either key.
        Records a new attempt if the limit is not exceeded.
        """
        if ip:
            self._check_and_record(f"ip:{ip}")
        if username:
            self._check_and_record(f"user:{username.strip().lower()}")

    # ──────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _check_and_record(self, key: str) -> None:
        """Atomically increment the counter for *key* and raise 429 if over limit."""
        from pymongo import ReturnDocument

        # Integer-based epoch calculation guarantees 0 microsecond drift across requests
        now_ts = int(datetime.now(timezone.utc).timestamp())
        window_start_ts = now_ts - (now_ts % self.window_seconds)
        window_start = datetime.fromtimestamp(window_start_ts, tz=timezone.utc)
        expires_at = window_start + timedelta(seconds=self.window_seconds * 2)

        col = self._get_col()
        try:
            result = col.find_one_and_update(
                {"key": key, "window_start": window_start},
                {
                    "$inc": {"count": 1},
                    "$setOnInsert": {
                        "key": key,
                        "window_start": window_start,
                        "expires_at": expires_at,
                    },
                },
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
            count = result.get("count", 1) if result else 1
        except Exception as exc:
            # If MongoDB is temporarily unavailable, fail open (allow the request)
            # rather than locking out all users.
            logger.error("Rate limiter MongoDB error (failing open): %s", exc)
            return

        if count > self.max_requests:
            detail = self.custom_detail or (
                f"Too many requests. "
                f"Please wait {self.window_seconds} seconds before trying again."
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=detail,
            )


# ── Singletons — shared across all workers via MongoDB ────────────────────────
login_limiter = MongoRateLimiter(max_requests=5, window_seconds=60)
chat_limiter = MongoRateLimiter(max_requests=15, window_seconds=60)
otp_limiter = MongoRateLimiter(
    max_requests=3,
    window_seconds=900,
    custom_detail="Too many OTP requests. Maximum 3 OTPs per 15 minutes allowed. Please try again later.",
)


# ── OTP Failure Lockout ───────────────────────────────────────────────────────

class OtpFailureLockout:
    """MongoDB-backed consecutive OTP failure tracker with automatic lockout.

    After MAX_FAILURES wrong OTP submissions for the same email the account
    is locked for LOCKOUT_SECONDS. MongoDB TTL ensures the lock document is
    automatically deleted, so no manual expiry management is required.

    Parameters
    ----------
    max_failures : int
        Number of consecutive wrong OTPs before the account is locked.
    lockout_seconds : int
        Duration of the lockout window in seconds.
    """

    def __init__(self, max_failures: int = 5, lockout_seconds: int = 900) -> None:
        self.max_failures = max_failures
        self.lockout_seconds = lockout_seconds
        self._col = None  # lazy-loaded

    def _get_col(self):
        """Lazy-load the otp_lockouts collection."""
        if self._col is not None:
            return self._col
        from app.db.mongodb import db  # noqa: PLC0415
        col = db["otp_lockouts"]
        try:
            # TTL index: MongoDB auto-deletes expired lockout documents.
            col.create_index("expires_at", expireAfterSeconds=0, background=True)
            col.create_index("email", unique=True, background=True)
        except Exception as exc:
            logger.warning("OtpFailureLockout: could not create indexes: %s", exc)
        self._col = col
        return col

    def check_locked(self, email: str) -> None:
        """Raise HTTP 429 if the email is currently locked out.

        Should be called *before* any OTP hash comparison.
        """
        col = self._get_col()
        email_key = email.strip().lower()
        try:
            doc = col.find_one({"email": email_key, "locked": True})
            if doc:
                remaining = max(
                    0,
                    int(
                        (doc["expires_at"] - datetime.now(timezone.utc))
                        .total_seconds()
                    ),
                )
                mins = remaining // 60
                secs = remaining % 60
                time_str = f"{mins}m {secs}s" if mins else f"{secs}s"
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=(
                        f"Account temporarily locked after {self.max_failures} failed OTP "
                        f"attempts. Please try again in {time_str} or request a new OTP."
                    ),
                )
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("OtpFailureLockout.check_locked error (failing open): %s", exc)

    def record_failure(self, email: str) -> None:
        """Increment the failure counter and lock the account if the limit is reached."""
        from pymongo import ReturnDocument  # noqa: PLC0415

        col = self._get_col()
        email_key = email.strip().lower()
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=self.lockout_seconds)

        try:
            result = col.find_one_and_update(
                {"email": email_key},
                {
                    "$inc": {"failures": 1},
                    "$set": {"expires_at": expires_at},
                    "$setOnInsert": {"locked": False},
                },
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
            failures = result.get("failures", 1) if result else 1

            if failures >= self.max_failures and not result.get("locked", False):
                col.update_one(
                    {"email": email_key},
                    {"$set": {"locked": True, "expires_at": expires_at}},
                )
                logger.warning(
                    "OTP lockout triggered for %s after %d consecutive failures.",
                    email_key,
                    failures,
                )
        except Exception as exc:
            logger.error("OtpFailureLockout.record_failure error: %s", exc)

    def reset(self, email: str) -> None:
        """Clear the failure counter on a successful OTP submission."""
        col = self._get_col()
        email_key = email.strip().lower()
        try:
            col.delete_one({"email": email_key})
        except Exception as exc:
            logger.error("OtpFailureLockout.reset error: %s", exc)


# Singleton — one per purpose so limits stay independent
otp_failure_lockout = OtpFailureLockout(max_failures=5, lockout_seconds=900)

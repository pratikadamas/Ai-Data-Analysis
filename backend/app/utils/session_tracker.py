"""Thread-safe active user session tracker for webapp monitoring."""
from __future__ import annotations

import time
from datetime import datetime, timezone
from threading import Lock
from typing import Any


class ActiveSessionTracker:
    """Tracks live user sessions and heartbeat activity across the web application."""

    def __init__(self, timeout_seconds: int = 300) -> None:
        self.timeout_seconds = timeout_seconds  # 5 minutes idle timeout
        self._sessions: dict[str, dict[str, Any]] = {}
        self._lock = Lock()

    def record_activity(
        self,
        user_id_or_email: str,
        username: str,
        role: str = "user",
        ip_address: str = "127.0.0.1",
        user_agent: str = "Browser",
    ) -> None:
        """Record or update active session timestamp for a user."""
        if not user_id_or_email:
            return

        now = time.time()
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._lock:
            if user_id_or_email in self._sessions:
                self._sessions[user_id_or_email]["last_seen"] = now
                self._sessions[user_id_or_email]["last_seen_iso"] = now_iso
                self._sessions[user_id_or_email]["ip_address"] = ip_address
                self._sessions[user_id_or_email]["user_agent"] = user_agent
            else:
                self._sessions[user_id_or_email] = {
                    "user_key": user_id_or_email,
                    "username": username,
                    "role": role,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "login_at": now_iso,
                    "last_seen": now,
                    "last_seen_iso": now_iso,
                }

    def remove_session(self, user_id_or_email: str) -> None:
        """Remove a session explicitly (e.g. on logout)."""
        with self._lock:
            self._sessions.pop(user_id_or_email, None)

    def get_active_sessions(self) -> list[dict[str, Any]]:
        """Return list of active sessions that haven't timed out."""
        now = time.time()
        active = []
        with self._lock:
            # Clean expired sessions & return active
            expired_keys = []
            for k, session in self._sessions.items():
                idle_seconds = now - session["last_seen"]
                if idle_seconds > self.timeout_seconds:
                    expired_keys.append(k)
                else:
                    active.append({
                        "user_key": session["user_key"],
                        "username": session["username"],
                        "role": session["role"],
                        "ip_address": session["ip_address"],
                        "user_agent": session["user_agent"],
                        "login_at": session["login_at"],
                        "last_seen_iso": session["last_seen_iso"],
                        "idle_seconds": round(idle_seconds, 1),
                    })
            for ek in expired_keys:
                self._sessions.pop(ek, None)
        return active

    def get_summary(self) -> dict[str, Any]:
        """Return counts breakdown of active sessions."""
        sessions = self.get_active_sessions()
        total_active = len(sessions)
        admin_active = sum(1 for s in sessions if s.get("role") == "admin")
        user_active = total_active - admin_active

        return {
            "total_active_sessions": total_active,
            "active_admin_sessions": admin_active,
            "active_user_sessions": user_active,
            "sessions": sessions,
        }


# Singleton instance shared across the backend application
active_session_tracker = ActiveSessionTracker(timeout_seconds=300)

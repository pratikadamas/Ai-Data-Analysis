"""In-memory ring buffer logging handler to capture backend logs for Admin UI streaming."""
from __future__ import annotations

import logging
from collections import deque
from datetime import datetime
from threading import Lock
from typing import Any


class MemoryLogHandler(logging.Handler):
    """Custom logging handler storing recent log records in a thread-safe deque."""

    def __init__(self, capacity: int = 500) -> None:
        super().__init__()
        self.capacity = capacity
        self._buffer: deque[dict[str, Any]] = deque(maxlen=capacity)
        self._lock = Lock()

    def emit(self, record: logging.LogRecord) -> None:
        try:
            try:
                msg = self.format(record)
            except Exception:
                msg = str(record.getMessage() if hasattr(record, "getMessage") else record.msg)

            entry = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "level": str(record.levelname),
                "logger": str(record.name),
                "message": str(msg),
            }
            with self._lock:
                self._buffer.append(entry)
        except Exception:
            pass

    def get_logs(self, limit: int = 100, level: str | None = None, search: str | None = None) -> list[dict[str, Any]]:
        with self._lock:
            logs = list(self._buffer)

        # Newest logs first
        logs.reverse()

        if level and level.upper() != "ALL":
            logs = [log for log in logs if log["level"].upper() == level.upper()]

        if search:
            query = search.lower()
            logs = [
                log for log in logs
                if query in log["message"].lower() or query in log["logger"].lower()
            ]

        return logs[:limit]

    def clear(self) -> None:
        with self._lock:
            self._buffer.clear()


# Global singleton instance
memory_log_handler = MemoryLogHandler(capacity=500)
memory_log_handler.setFormatter(
    logging.Formatter("[%(asctime)s] [%(levelname)s] %(name)s: %(message)s")
)

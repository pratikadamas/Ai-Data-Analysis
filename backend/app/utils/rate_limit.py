"""In-memory sliding window rate limiter."""
from __future__ import annotations

import time
from collections import defaultdict
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status

class RateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # Dictionary mapping a key to a list of attempt timestamps
        self.attempts: dict[str, list[float]] = defaultdict(list)

    def check_rate_limit(self, ip: str, username: str | None = None) -> None:
        """Check sliding window rate limits for both IP and username."""
        now = time.time()
        
        # Check IP-level limits
        self._check_key_limit(f"ip:{ip}", now)
        
        # Check Username-level limits (if provided)
        if username:
            self._check_key_limit(f"user:{username.strip().lower()}", now)

    def _check_key_limit(self, key: str, now: float) -> None:
        # Keep only timestamps that fall within the window
        cutoff = now - self.window_seconds
        self.attempts[key] = [t for t in self.attempts[key] if t > cutoff]
        
        if len(self.attempts[key]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many login attempts. Please wait {self.window_seconds} seconds before trying again."
            )
        
        # Record attempt timestamp
        self.attempts[key].append(now)

# Export standard login limiter (5 attempts per minute)
login_limiter = RateLimiter(max_requests=5, window_seconds=60)

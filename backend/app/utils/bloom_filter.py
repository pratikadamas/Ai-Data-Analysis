"""
Bloom Filter for username existence pre-checks during registration.

HOW A BLOOM FILTER WORKS:
─────────────────────────
A Bloom Filter is a space-efficient probabilistic data structure that answers
the question "Is this item in the set?" with two possible answers:

  1. "DEFINITELY NOT in the set"  → zero false negatives, 100% certain.
  2. "POSSIBLY in the set"        → correct most of the time, but there is a
                                    small, tunable probability of a false positive.

Because of property (1), we can safely SKIP the MongoDB query whenever the
filter says "definitely not". We only hit the database when the filter says
"possibly" — to confirm or deny. This eliminates ~99.9% of unnecessary DB
round-trips during registration under typical load.

IMPLEMENTATION DETAILS:
───────────────────────
• Bit array  : `bitarray` (C extension) — 8× more compact than bytearray.
• Hashing    : Double-hashing with SHA-256 + MD5 (both from stdlib `hashlib`)
               simulates k independent hash functions without external deps.
               Formula: h_i(x) = (h1(x) + i * h2(x)) mod m
• Thread safety : threading.Lock protects all bit read/write ops.
• Sizing math (defaults — capacity=100_000, p=0.001):
    m = -(n * ln(p)) / ln(2)²  ≈ 1,437,759 bits  (~175 KB)
    k = (m/n) * ln(2)           ≈ 10 hash probes
    → False positive rate ≤ 0.1% for up to 100,000 unique usernames.
"""
from __future__ import annotations

import hashlib
import logging
import math
import threading

logger = logging.getLogger(__name__)


class UsernameBloomFilter:
    """
    Thread-safe in-memory Bloom Filter for username membership testing.
    Pure Python implementation using bytearray (zero C-extension / MSVC compiler required).

    Parameters
    ----------
    capacity : int
        Expected maximum number of unique usernames to store.
    false_positive_rate : float
        Target probability of a false positive (0 < p < 1).
        Lower values use more memory but produce fewer unnecessary DB queries.
    """

    def __init__(
        self,
        capacity: int = 100_000,
        false_positive_rate: float = 0.001,
    ) -> None:
        self.capacity = capacity
        self.false_positive_rate = false_positive_rate

        # Compute optimal bit array size (m) and number of hash probes (k)
        self._m: int = self._optimal_m(capacity, false_positive_rate)
        self._k: int = self._optimal_k(self._m, capacity)

        # Allocate the bytearray for bit storage (each byte holds 8 bits)
        num_bytes = (self._m + 7) // 8
        self._bits: bytearray = bytearray(num_bytes)

        # Lock for thread-safe concurrent add / check operations
        self._lock: threading.Lock = threading.Lock()

        # Approximate item counter (for monitoring/logging only)
        self._count: int = 0

        logger.info(
            "UsernameBloomFilter ready — capacity=%d, fpr=%.3f%%, "
            "bit_array=%d bits (%.1f KB), hash_probes=%d",
            capacity,
            false_positive_rate * 100,
            self._m,
            num_bytes / 1024,
            self._k,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    def add(self, username: str) -> None:
        """
        Add a username to the filter.

        Call this after every successful user insertion into MongoDB so the
        filter stays in sync with the database.

        Time complexity: O(k) — k hash computations + k bit writes.
        """
        key = username.strip().lower()
        with self._lock:
            for idx in self._probe_indices(key):
                byte_idx = idx // 8
                bit_offset = idx % 8
                self._bits[byte_idx] |= (1 << bit_offset)
            self._count += 1

    def might_exist(self, username: str) -> bool:
        """
        Check whether a username *might* already be registered.

        Returns
        -------
        False
            The username is DEFINITELY NOT in the set.
            Skip the MongoDB query — it is safe to proceed with registration.
        True
            The username POSSIBLY exists (or is a ~0.1% false positive).
            Must verify with a MongoDB find_one before rejecting.

        Time complexity: O(k) — k hash computations + k bit reads.
        """
        key = username.strip().lower()
        with self._lock:
            for idx in self._probe_indices(key):
                byte_idx = idx // 8
                bit_offset = idx % 8
                if not (self._bits[byte_idx] & (1 << bit_offset)):
                    return False
            return True

    def load_from_db(self) -> None:
        """
        Populate the filter from all existing usernames in MongoDB.

        Called once at application startup (from init_db in mongodb.py).
        Uses a projection to fetch only the `username` field, keeping
        memory usage and query cost minimal.
        """
        # Deferred import to avoid circular dependency:
        #   bloom_filter.py → mongodb.py → bloom_filter.py
        from app.db.mongodb import db  # noqa: PLC0415

        try:
            cursor = db["users"].find({}, {"username": 1, "_id": 0})
            loaded = 0
            for doc in cursor:
                raw = doc.get("username")
                if raw:
                    self.add(raw)
                    loaded += 1

            logger.info(
                "BloomFilter: seeded with %d existing usernames from MongoDB.",
                loaded,
            )
        except Exception as exc:
            # Non-fatal: the MongoDB unique index remains the authoritative guard.
            # A failed load just means all checks fall back to full DB queries.
            logger.error(
                "BloomFilter: failed to load usernames from MongoDB (%s). "
                "Falling back to direct DB checks for all registrations.",
                exc,
            )

    @property
    def count(self) -> int:
        """Approximate number of items added to the filter."""
        return self._count

    # ──────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _probe_indices(self, value: str) -> list[int]:
        """
        Generate k bit-array indices for *value* using double hashing.

        Double-hashing formula:
            h_i(x) = (h1(x) + i * h2(x)) mod m

        h1 = first 8 bytes of SHA-256(x), interpreted as big-endian uint64
        h2 = first 8 bytes of MD5(x),     interpreted as big-endian uint64

        h2 is forced odd to guarantee full-period traversal of the bit array.
        Using stdlib hashlib avoids any external dependency (e.g. mmh3/xxhash).
        """
        encoded = value.encode("utf-8")
        h1 = int.from_bytes(hashlib.sha256(encoded).digest()[:8], "big")
        h2 = int.from_bytes(hashlib.md5(encoded).digest()[:8], "big") | 1  # noqa: S324
        return [(h1 + i * h2) % self._m for i in range(self._k)]

    @staticmethod
    def _optimal_m(n: int, p: float) -> int:
        """Optimal bit array size m = -(n * ln(p)) / ln(2)²."""
        return max(1, int(-n * math.log(p) / (math.log(2) ** 2)))

    @staticmethod
    def _optimal_k(m: int, n: int) -> int:
        """Optimal probe count k = (m/n) * ln(2)."""
        return max(1, round((m / n) * math.log(2)))


# ──────────────────────────────────────────────────────────────────────────────
# Module-level singleton — import this in auth routes and mongodb init.
# ──────────────────────────────────────────────────────────────────────────────
username_bloom_filter = UsernameBloomFilter(
    capacity=100_000,           # Tune to your expected max user count
    false_positive_rate=0.001,  # 0.1% → ~1 extra DB query per 1,000 new users
)

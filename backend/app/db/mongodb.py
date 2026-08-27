"""MongoDB database client initialization."""
from __future__ import annotations

import logging
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from app.config import settings

logger = logging.getLogger(__name__)

# Import the Bloom Filter singleton.
# load_from_db() is called inside init_db() — after the connection is verified —
# so the filter is seeded exactly once before the first request is ever handled.
# pyrefly: ignore [missing-import]
from app.utils.bloom_filter import username_bloom_filter  # noqa: E402

# Lazy initialization of pymongo client
client = MongoClient(settings.mongodb_uri)
db = client[settings.database_name]

def init_db():
    """Initialize database indexes and verify connection."""
    try:
        # Test connection
        client.admin.command("ping")
        logger.info("Successfully connected to MongoDB.")

        users = db["users"]
        # Unique indexes
        users.create_index("username", unique=True)
        users.create_index("email", unique=True)
        
        # Email verifications (TTL 600s = 10m)
        email_verifications = db["email_verifications"]
        email_verifications.create_index("user_id")
        email_verifications.create_index("expires_at", expireAfterSeconds=600)
        
        # Password resets (TTL 300s = 5m)
        password_resets = db["password_resets"]
        password_resets.create_index("user_id")
        password_resets.create_index("expires_at", expireAfterSeconds=300)

        # Google OAuth users: sparse unique index on firebase_uid
        users.create_index("firebase_uid", unique=True, sparse=True)

        logger.info("MongoDB unique and TTL indexes initialized successfully.")

        # ── Seed the Bloom Filter ──────────────────────────────────────────────
        # One-time bulk read of all existing usernames. After this point, every
        # registration attempt checks the filter first — only querying MongoDB
        # when the filter indicates a potential collision (~0.1% of new users).
        username_bloom_filter.load_from_db()

    except Exception as e:
        logger.error(f"Failed to initialize MongoDB connection or indexes: {e}")

# Trigger DB initialization
init_db()

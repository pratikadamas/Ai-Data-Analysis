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
        users.create_index("firebase_uid", unique=True, sparse=True)

        # Performance indexes for Admin listing, search, and sorting
        users.create_index([("created_at", -1)])
        users.create_index([("role", 1), ("created_at", -1)])
        
        # Email verifications: lookup by user_id + used + created_at
        email_verifications = db["email_verifications"]
        email_verifications.create_index("user_id")
        email_verifications.create_index([("user_id", 1), ("used", 1), ("created_at", -1)])
        email_verifications.create_index("expires_at", expireAfterSeconds=600)
        
        # Password resets: lookup by user_id + used + created_at
        password_resets = db["password_resets"]
        password_resets.create_index("user_id")
        password_resets.create_index([("user_id", 1), ("used", 1), ("created_at", -1)])
        password_resets.create_index("expires_at", expireAfterSeconds=300)

        # Groq API Usage collection
        groq_usage = db["groq_usage"]
        groq_usage.create_index("date", unique=True)

        logger.info("MongoDB unique, performance, and TTL indexes initialized successfully.")

        # ── Seed the Bloom Filter ──────────────────────────────────────────────
        # One-time bulk read of all existing usernames. After this point, every
        # registration attempt checks the filter first — only querying MongoDB
        # when the filter indicates a potential collision (~0.1% of new users).
        username_bloom_filter.load_from_db()

    except Exception as e:
        logger.error(f"Failed to initialize MongoDB connection or indexes: {e}")

def track_groq_usage(call_type: str = "chat", tokens_estimated: int = 150) -> None:
    """Record daily Groq API usage in MongoDB groq_usage collection."""
    try:
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        db.groq_usage.update_one(
            {"date": today},
            {
                "$inc": {
                    "total_calls": 1,
                    f"calls.{call_type}": 1,
                    "tokens_estimated": tokens_estimated,
                },
                "$set": {
                    "updated_at": datetime.now(),
                },
            },
            upsert=True,
        )
        logger.info(f"Groq API usage tracked successfully for date: {today}")
    except Exception as exc:
        logger.error(f"Failed to track Groq usage: {exc}")


# Trigger DB initialization
init_db()


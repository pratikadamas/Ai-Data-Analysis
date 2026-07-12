"""MongoDB database client initialization."""
from __future__ import annotations

import logging
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from app.config import settings

logger = logging.getLogger(__name__)

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
        
        logger.info("MongoDB unique and TTL indexes initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB connection or indexes: {e}")

# Trigger DB initialization
init_db()

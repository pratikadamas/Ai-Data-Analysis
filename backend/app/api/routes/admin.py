"""Admin endpoints for Admin Portal: Demo login, paginated MongoDB user management, system health, live log streamer, and Groq API usage tracker."""
from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.config import settings
from app.db.duckdb_manager import duckdb_manager
from app.db.mongodb import db, client
from app.utils.auth import create_access_token, get_current_user
from app.utils.logger_streamer import memory_log_handler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminLoginRequest(BaseModel):
    email: str
    password: str


# Helper dependency to verify Admin privileges
async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    role = current_user.get("role", "user")
    is_admin = current_user.get("is_admin", False) or role == "admin"
    # Allow demo admin account as well
    if current_user.get("email") == "admin@demo.com" or is_admin:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin authorization required.",
    )


# ── 1. Admin Login Endpoint (with Demo quick login) ───────────────────────────
@router.post("/login")
async def admin_login(payload: AdminLoginRequest) -> dict[str, Any]:
    email_clean = payload.email.strip().lower()
    password = payload.password.strip()

    # Demo Admin Account check
    if email_clean == "admin@demo.com" and password == "admin123":
        users_col = db["users"]
        demo_user = users_col.find_one({"email": "admin@demo.com"})
        if not demo_user:
            from app.utils.auth import hash_password
            demo_doc = {
                "username": "admin_demo",
                "email": "admin@demo.com",
                "hashed_password": hash_password("admin123"),
                "role": "admin",
                "is_admin": True,
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.utcnow(),
            }
            users_col.insert_one(demo_doc)

        access_token = create_access_token(data={"sub": "admin_demo", "role": "admin"})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": "Admin Demo",
                "email": "admin@demo.com",
                "role": "admin",
                "is_admin": True,
            },
        }

    # Check MongoDB for existing admin users
    users_col = db["users"]
    user = users_col.find_one({"email": email_clean})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )

    # Check password
    from app.utils.auth import verify_password
    if not verify_password(password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )

    role = user.get("role", "user")
    is_admin = user.get("is_admin", False) or role == "admin"

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User does not have admin privileges.",
        )

    access_token = create_access_token(data={"sub": user["username"], "role": "admin"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "role": "admin",
            "is_admin": True,
        },
    }


# ── 2. Paginated User List (MongoDB .skip & .limit) ─────────────────────────
@router.get("/users")
async def get_paginated_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    admin_user: dict = Depends(get_admin_user),
) -> dict[str, Any]:
    users_col = db["users"]
    query: dict[str, Any] = {}

    if role == "admin":
        admin_match = [{"role": "admin"}, {"is_admin": True}]
        if search:
            s = search.strip()
            search_match = [{"username": {"$regex": s, "$options": "i"}}, {"email": {"$regex": s, "$options": "i"}}]
            query = {"$and": [{"$or": admin_match}, {"$or": search_match}]}
        else:
            query = {"$or": admin_match}
    elif role == "user":
        user_match = {"role": {"$ne": "admin"}, "is_admin": {"$ne": True}}
        if search:
            s = search.strip()
            search_match = [{"username": {"$regex": s, "$options": "i"}}, {"email": {"$regex": s, "$options": "i"}}]
            query = {"$and": [user_match, {"$or": search_match}]}
        else:
            query = user_match
    elif search:
        s = search.strip()
        query["$or"] = [
            {"username": {"$regex": s, "$options": "i"}},
            {"email": {"$regex": s, "$options": "i"}},
        ]

    total_users = users_col.count_documents(query)
    admin_count = users_col.count_documents({"$or": [{"role": "admin"}, {"is_admin": True}]})
    standard_user_count = users_col.count_documents({"role": {"$ne": "admin"}, "is_admin": {"$ne": True}})

    skip = (page - 1) * limit

    # Perform server-side pagination with skip and limit
    cursor = (
        users_col.find(query, {"hashed_password": 0, "otp_hash": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    users_list = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("created_at"), datetime):
            doc["created_at"] = doc["created_at"].isoformat()
        users_list.append(doc)

    total_pages = (total_users + limit - 1) // limit if limit > 0 else 1

    return {
        "users": users_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_users": total_users,
            "admin_count": admin_count,
            "standard_user_count": standard_user_count,
            "total_pages": max(total_pages, 1),
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


# ── 3. Health Check Endpoint ──────────────────────────────────────────────────
@router.get("/health")
async def admin_health_check(
    admin_user: dict = Depends(get_admin_user),
) -> dict[str, Any]:
    start_time = time.time()
    db_status = "unknown"
    db_ping_ms = 0.0

    try:
        ping_start = time.time()
        client.admin.command("ping")
        db_ping_ms = round((time.time() - ping_start) * 1000, 2)
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {exc}"

    duckdb_connections = len(duckdb_manager._connections)
    from app.utils.session_tracker import active_session_tracker
    session_summary = active_session_tracker.get_summary()

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "env": settings.app_env,
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "mongodb": {
            "status": db_status,
            "ping_ms": db_ping_ms,
            "database_name": settings.database_name,
        },
        "duckdb": {
            "active_connections": duckdb_connections,
        },
        "active_sessions": session_summary,
        "groq_configured": bool(settings.groq_api_key),
    }


# ── 3b. Active Sessions Tracker Endpoint ──────────────────────────────────────
@router.get("/active-sessions")
async def get_active_sessions(
    admin_user: dict = Depends(get_admin_user),
) -> dict[str, Any]:
    from app.utils.session_tracker import active_session_tracker
    return active_session_tracker.get_summary()


# ── 4. System Log Viewer Streamer ─────────────────────────────────────────────
@router.get("/logs")
async def get_system_logs(
    limit: int = Query(default=100, ge=1, le=500),
    level: str | None = Query(default="ALL"),
    search: str | None = Query(default=None),
    admin_user: dict = Depends(get_admin_user),
) -> dict[str, Any]:
    logs = memory_log_handler.get_logs(limit=limit, level=level, search=search)
    return {
        "logs": logs,
        "count": len(logs),
        "capacity": memory_log_handler.capacity,
    }


# ── 5. Groq API Usage Analytics (Graphical Data) ──────────────────────────────
@router.get("/groq-usage")
async def get_groq_usage(
    admin_user: dict = Depends(get_admin_user),
) -> dict[str, Any]:
    usage_col = db["groq_usage"]
    cursor = usage_col.find().sort("date", 1)

    daily_records = []
    total_calls_all_time = 0
    total_tokens_all_time = 0

    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("updated_at"), datetime):
            doc["updated_at"] = doc["updated_at"].isoformat()

        date_str = doc.get("date", "")
        calls = doc.get("total_calls", 0)
        tokens = doc.get("tokens_estimated", 0)

        total_calls_all_time += calls
        total_tokens_all_time += tokens

        daily_records.append({
            "date": date_str,
            "total_calls": calls,
            "tokens_estimated": tokens,
            "calls_breakdown": doc.get("calls", {}),
        })

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today_doc = usage_col.find_one({"date": today_str})
    today_calls = today_doc.get("total_calls", 0) if today_doc else 0

    return {
        "daily_records": daily_records,
        "summary": {
            "total_calls_all_time": total_calls_all_time,
            "total_tokens_all_time": total_tokens_all_time,
            "today_calls": today_calls,
            "recorded_days": len(daily_records),
        },
    }

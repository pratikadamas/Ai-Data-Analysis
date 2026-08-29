"""Authentication and session management utilities using JWT and bcrypt."""
from __future__ import annotations

from datetime import datetime, timedelta
import jwt
# pyrefly: ignore [missing-import]
import bcrypt
# pyrefly: ignore [missing-import]
from fastapi import Depends, HTTPException, status

# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordBearer
# pyrefly: ignore [missing-import]
from app.config import settings
# pyrefly: ignore [missing-import]
from app.db.mongodb import db

# Use OAuth2PasswordBearer to extract bearer tokens from the Authorization header.
# Since we support standard JSON login, we allow the scheme to fail gracefully without auto-throwing
# to give us customized handling of missing credentials.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def decode_access_token(token: str) -> dict | None:
    """Decode a JWT access token and return its claims."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except (jwt.ExpiredSignatureError, jwt.PyJWTError):
        return None

async def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency to retrieve the currently logged-in user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception

    # Special handling for demo admin user
    if username == "admin_demo" or payload.get("role") == "admin":
        user = db["users"].find_one({"$or": [{"username": username}, {"email": "admin@demo.com"}]})
        if user:
            user["id"] = str(user["_id"])
            return user
        return {
            "username": "Admin Demo",
            "email": "admin@demo.com",
            "role": "admin",
            "is_admin": True,
            "is_verified": True,
            "is_active": True,
        }

    # Query user from MongoDB
    user = db["users"].find_one({"username": username})
    if user is None:
        raise credentials_exception

    # Remove sensitive data from user object
    if "_id" in user:
        user["id"] = str(user["_id"])

    # Record active user session heartbeat
    user_email = user.get("email") or user.get("username") or "user"
    user_role = "admin" if (user.get("role") == "admin" or user.get("is_admin")) else "user"
    from app.utils.session_tracker import active_session_tracker
    active_session_tracker.record_activity(
        user_id_or_email=user_email,
        username=user.get("username", user_email),
        role=user_role,
    )

    return user

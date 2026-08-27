"""Authentication endpoints: Register, OTP Verification, Login, Forgot & Reset Password, Profile."""
from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

# pyrefly: ignore [missing-import]
from app.config import settings
# pyrefly: ignore [missing-import]
from app.db.mongodb import db
# pyrefly: ignore [missing-import]
from app.utils.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
# pyrefly: ignore [missing-import]
from app.utils.bloom_filter import username_bloom_filter
# pyrefly: ignore [missing-import]
from app.utils.firebase_admin_sdk import verify_firebase_token
# pyrefly: ignore [missing-import]
from app.utils.mail import send_otp_email
# pyrefly: ignore [missing-import]
from app.utils.rate_limit import login_limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- Request/Response Models ---

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    password: str  # The new password
    otp: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class ResendOTPRequest(BaseModel):
    email: str
    purpose: str = Field(default="registration")  # "registration" or "reset"

class GoogleAuthRequest(BaseModel):
    id_token: str  # Firebase ID token from the frontend

# --- Helper Functions ---

def generate_otp() -> str:
    """Generate a secure 6-digit numerical OTP."""
    return "".join(secrets.choice("0123456789") for _ in range(6))

# --- Endpoints ---

@router.post("/register")
async def register(payload: RegisterRequest):
    users_col = db["users"]
    username_clean = payload.username.strip()

    # ── STEP 1: Bloom Filter pre-check (zero DB I/O) ──────────────────────────
    #
    # The Bloom Filter answers in O(k) in-memory bit-reads.
    #
    #   might_exist() == False  →  username DEFINITELY does not exist.
    #                              Skip the MongoDB query entirely. ✅
    #
    #   might_exist() == True   →  username POSSIBLY exists (real duplicate
    #                              OR a ~0.1% false positive).
    #                              Proceed to Step 2 to confirm.
    #
    if username_bloom_filter.might_exist(username_clean):
        # ── STEP 2: DB confirmation (only reached ~0.1% of the time) ──────────
        if users_col.find_one({"username": username_clean}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists. Please choose another username."
            )
    # If might_exist() returned False, we skip Step 2 entirely — no DB read.

    # Email uniqueness always requires a direct DB check (no email filter)
    if users_col.find_one({"email": payload.email.strip().lower()}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
        
    # Create the user document (unverified by default)
    user_doc = {
        "username": username_clean,
        "email": payload.email.strip().lower(),
        "hashed_password": hash_password(payload.password),
        "role": "user",
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow()
    }
    
    result = users_col.insert_one(user_doc)
    user_id = result.inserted_id

    # ── STEP 3: Keep the Bloom Filter in sync ─────────────────────────────────
    # Add the new username immediately so the next registration attempt for
    # this same username is caught at the filter level without a DB query.
    username_bloom_filter.add(username_clean)
    
    # Generate and store OTP
    otp = generate_otp()
    otp_hash = hash_password(otp)
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    
    db["email_verifications"].insert_one({
        "user_id": user_id,
        "otp_hash": otp_hash,
        "expires_at": otp_expiry,
        "used": False,
        "created_at": datetime.utcnow()
    })
    
    # Send registration OTP
    send_otp_email(user_doc["email"], user_doc["username"], otp, purpose="registration")
    
    return {
        "status": "success",
        "message": "User registered successfully. Please verify your email with the OTP sent.",
        "email": user_doc["email"]
    }

@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPRequest):
    users_col = db["users"]
    user = users_col.find_one({"email": payload.email.strip().lower()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if user.get("is_verified"):
        return {"status": "success", "message": "Email is already verified"}

    verifications_col = db["email_verifications"]
    verification = verifications_col.find_one(
        {"user_id": user["_id"], "used": False},
        sort=[("created_at", -1)]
    )
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid verification request found or OTP has expired."
        )
        
    if not verify_password(payload.otp.strip(), verification["otp_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
        
    # Mark user as verified
    users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_verified": True}}
    )
    
    # Mark OTP as used
    verifications_col.update_one(
        {"_id": verification["_id"]},
        {"$set": {"used": True}}
    )
    
    return {"status": "success", "message": "Email verified successfully. You can now log in."}


OTP_RESEND_COOLDOWN_SECONDS = 60  # Users must wait 60 s between resend requests

@router.post("/resend-otp")
async def resend_otp(payload: ResendOTPRequest):
    """Resend OTP for registration verification or password reset."""
    users_col = db["users"]
    user = users_col.find_one({"email": payload.email.strip().lower()})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with that email address."
        )

    now = datetime.utcnow()

    if payload.purpose == "registration":
        if user.get("is_verified"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is already verified. Please sign in."
            )
        col = db["email_verifications"]
        email_purpose = "registration"
    elif payload.purpose == "reset":
        col = db["password_resets"]
        email_purpose = "forgot password"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid purpose. Must be 'registration' or 'reset'."
        )

    # Check cooldown: find most recent OTP for this user (used or not)
    last_doc = col.find_one(
        {"user_id": user["_id"]},
        sort=[("created_at", -1)]
    )

    if last_doc:
        elapsed = (now - last_doc["created_at"]).total_seconds()
        if elapsed < OTP_RESEND_COOLDOWN_SECONDS:
            wait_seconds = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            next_allowed_at = last_doc["created_at"] + timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {wait_seconds} second(s) before requesting another OTP.",
                headers={"X-Next-Allowed-At": next_allowed_at.isoformat()}
            )

    # Invalidate all old unused OTPs for this user
    col.update_many(
        {"user_id": user["_id"], "used": False},
        {"$set": {"used": True}}
    )

    # Generate fresh OTP
    otp = generate_otp()
    otp_hash = hash_password(otp)
    otp_expiry = now + timedelta(minutes=10)

    col.insert_one({
        "user_id": user["_id"],
        "otp_hash": otp_hash,
        "expires_at": otp_expiry,
        "used": False,
        "created_at": now
    })

    send_otp_email(user["email"], user["username"], otp, purpose=email_purpose)

    next_allowed_at = now + timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    return {
        "status": "success",
        "message": "A new OTP has been sent to your email.",
        "next_allowed_at": next_allowed_at.isoformat()
    }


@router.post("/login")
async def login(payload: LoginRequest, request: Request):
    # Apply Rate limiting (max 5 requests per minute based on IP + Email)
    client_ip = request.client.host if request.client else "unknown"
    login_limiter.check_rate_limit(ip=client_ip, username=payload.email.strip().lower())

    users_col = db["users"]
    user = users_col.find_one({"email": payload.email.strip().lower()})
    
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not user.get("is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not verified. Please verify your email first.",
            headers={"X-Account-Email": user["email"]}
        )
        
    # Generate JWT Session Token (still using username for the sub claim as it's uniquely identifying)
    access_token = create_access_token(data={"sub": user["username"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "created_at": user.get("created_at")
        }
    }

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    users_col = db["users"]
    user = users_col.find_one({"email": payload.email.strip().lower()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized access"
        )
        
    otp = generate_otp()
    otp_hash = hash_password(otp)
    otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    
    db["password_resets"].insert_one({
        "user_id": user["_id"],
        "otp_hash": otp_hash,
        "expires_at": otp_expiry,
        "used": False,
        "created_at": datetime.utcnow()
    })
    
    send_otp_email(user["email"], user["username"], otp, purpose="forgot password")
    
    return {
        "status": "success",
        "message": "If the email is registered, a password reset code has been sent."
    }

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    users_col = db["users"]
    user = users_col.find_one({"email": payload.email.strip().lower()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with specified email not found"
        )
        
    resets_col = db["password_resets"]
    reset_doc = resets_col.find_one(
        {"user_id": user["_id"], "used": False},
        sort=[("created_at", -1)]
    )
    
    if not reset_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid password reset request found or OTP has expired."
        )
        
    if not verify_password(payload.otp.strip(), reset_doc["otp_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
        
    # Reset password
    hashed = hash_password(payload.password)
    users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": hashed}}
    )
    
    # Mark OTP as used
    resets_col.update_one(
        {"_id": reset_doc["_id"]},
        {"$set": {"used": True}}
    )
    
    return {
        "status": "success",
        "message": "Password reset successfully. You can now log in with your new password."
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "created_at": current_user.get("created_at")
    }

@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    users_col = db["users"]
    
    if not verify_password(payload.current_password, current_user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
        
    hashed = hash_password(payload.new_password)
    users_col.update_one(
        {"username": current_user["username"]},
        {"$set": {"hashed_password": hashed}}
    )
    
    return {"status": "success", "message": "Password changed successfully"}


@router.post("/google")
async def google_auth(payload: GoogleAuthRequest):
    """
    Authenticate a user via Google OAuth.

    Flow:
      1. Frontend obtains a Firebase ID token after Google popup sign-in.
      2. This endpoint verifies that token server-side with Firebase Admin SDK.
      3. Looks up the user in MongoDB by firebase_uid.
         - Found  → existing user, issue new session JWT.
         - Missing → create a new user document (Google-only account) and issue JWT.
      4. Returns the same shape as /login so the frontend can reuse the same handler.
    """
    # ── Verify the Firebase ID token ─────────────────────────────────────────
    try:
        firebase_user = verify_firebase_token(payload.id_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )

    uid = firebase_user["uid"]
    email = firebase_user["email"].strip().lower()
    name = firebase_user.get("name") or email.split("@")[0]  # fallback display name

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not have a verified email address."
        )

    users_col = db["users"]

    # ── Try to find existing user by firebase_uid (fastest path) ─────────────
    user = users_col.find_one({"firebase_uid": uid})

    if not user:
        # ── Also try by email in case they registered before with email/password
        user = users_col.find_one({"email": email})
        if user:
            # Merge: link their existing account to the Google provider
            users_col.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {"firebase_uid": uid, "is_verified": True},
                    "$addToSet": {"providers": "google"}
                }
            )
            user = users_col.find_one({"_id": user["_id"]})
        else:
            # ── Brand-new Google-only user ────────────────────────────────────
            # Build a unique username from their display name
            base_username = name.replace(" ", "").lower()[:30] or "user"
            username = base_username
            suffix = 1
            while users_col.find_one({"username": username}):
                username = f"{base_username}{suffix}"
                suffix += 1

            user_doc = {
                "username": username,
                "email": email,
                "hashed_password": None,          # Google-only: no password
                "firebase_uid": uid,
                "providers": ["google"],
                "is_verified": True,              # Google already verified the email
                "is_active": True,
                "role": "user",
                "created_at": datetime.utcnow(),
            }
            result = users_col.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            username_bloom_filter.add(username)
            user = user_doc

    # ── Issue application JWT ─────────────────────────────────────────────────
    access_token = create_access_token(data={"sub": user["username"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "created_at": user.get("created_at"),
        },
    }

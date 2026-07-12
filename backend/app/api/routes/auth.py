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

# --- Helper Functions ---

def generate_otp() -> str:
    """Generate a secure 6-digit numerical OTP."""
    return "".join(secrets.choice("0123456789") for _ in range(6))

# --- Endpoints ---

@router.post("/register")
async def register(payload: RegisterRequest):
    users_col = db["users"]
    
    # Check if username or email already exists
    if users_col.find_one({"username": payload.username.strip()}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken. Please try another username."
        )
    if users_col.find_one({"email": payload.email.strip().lower()}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
        
    # Create the user document (unverified by default)
    user_doc = {
        "username": payload.username.strip(),
        "email": payload.email.strip().lower(),
        "hashed_password": hash_password(payload.password),
        "role": "user",
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow()
    }
    
    result = users_col.insert_one(user_doc)
    user_id = result.inserted_id
    
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
    
    # Return success even if user not found for security purposes (no account enumeration)
    if not user:
        return {
            "status": "success",
            "message": "If the email is registered, a password reset code has been sent."
        }
        
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

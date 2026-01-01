from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str | None = None
    accept_terms: bool
    accept_privacy: bool
    accept_gdpr: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=dict)
async def register(request: RegisterRequest):
    """Register a new patient account"""
    # TODO: Implement registration logic
    return {"message": "Registration successful. Please verify your email."}


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login with email and password"""
    # TODO: Implement login logic
    return TokenResponse(
        access_token="example_access_token",
        refresh_token="example_refresh_token",
    )


@router.post("/logout")
async def logout():
    """Logout and revoke tokens"""
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token():
    """Refresh access token"""
    return TokenResponse(
        access_token="new_access_token",
        refresh_token="new_refresh_token",
    )


@router.post("/verify-email")
async def verify_email(token: str):
    """Verify email address"""
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
async def forgot_password(email: EmailStr):
    """Request password reset"""
    return {"message": "Password reset instructions sent"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """Reset password with token"""
    return {"message": "Password reset successfully"}

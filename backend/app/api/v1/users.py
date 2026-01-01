from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from uuid import UUID

router = APIRouter()


class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    email_verified: bool
    mfa_enabled: bool


class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None


@router.get("/me", response_model=UserProfile)
async def get_current_user():
    """Get current user profile"""
    # TODO: Implement with actual auth
    return UserProfile(
        id=UUID("00000000-0000-0000-0000-000000000000"),
        email="user@example.com",
        first_name="John",
        last_name="Doe",
        email_verified=True,
        mfa_enabled=False,
    )


@router.put("/me", response_model=UserProfile)
async def update_profile(request: UpdateProfileRequest):
    """Update user profile"""
    return UserProfile(
        id=UUID("00000000-0000-0000-0000-000000000000"),
        email="user@example.com",
        first_name=request.first_name or "John",
        last_name=request.last_name or "Doe",
        email_verified=True,
        mfa_enabled=False,
    )


@router.put("/me/password")
async def change_password(current_password: str, new_password: str):
    """Change password"""
    return {"message": "Password changed successfully"}


@router.delete("/me")
async def delete_account():
    """Delete account (GDPR right to erasure)"""
    return {"message": "Account deletion request submitted"}


@router.post("/me/link-nhs")
async def link_nhs_number(nhs_number: str):
    """Link NHS number to account"""
    return {"message": "NHS number linked successfully"}

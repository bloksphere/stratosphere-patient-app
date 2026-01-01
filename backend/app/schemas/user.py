"""User schemas."""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    """User creation schema (internal use)."""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    date_of_birth: str
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    """User update schema."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    marketing_consent: Optional[bool] = None


class UserResponse(BaseModel):
    """User response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    email_verified: bool
    phone: Optional[str]
    phone_verified: bool
    first_name: str
    last_name: str
    date_of_birth: str
    nhs_number: Optional[str]
    status: str
    mfa_enabled: bool
    gdpr_consent_date: Optional[datetime]
    data_processing_consent: bool
    marketing_consent: bool
    created_at: datetime
    last_login_at: Optional[datetime]


class UserProfile(BaseModel):
    """User profile schema (public view)."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    first_name: str
    last_name: str
    nhs_linked: bool
    email_verified: bool
    mfa_enabled: bool


class LinkNHSRequest(BaseModel):
    """Link NHS number request schema."""
    nhs_number: str = Field(..., min_length=10, max_length=12)
    date_of_birth: str  # For verification
    postcode: Optional[str] = None  # Additional verification

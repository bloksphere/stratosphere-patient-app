"""Appointment schemas."""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator


class AppointmentCreate(BaseModel):
    """Create appointment request schema."""
    appointment_type: str = Field(
        ...,
        description="Type: routine, follow_up, urgent, phone, video"
    )
    preferred_date: Optional[datetime] = None
    reason: str = Field(..., min_length=10, max_length=500)
    notes: Optional[str] = None

    @field_validator("appointment_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        """Validate appointment type."""
        valid_types = ["routine", "follow_up", "urgent", "phone", "video"]
        if v not in valid_types:
            raise ValueError(f"Invalid appointment type. Must be one of: {valid_types}")
        return v


class AppointmentUpdate(BaseModel):
    """Update appointment schema."""
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    """Appointment response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    appointment_type: str
    status: str
    scheduled_at: Optional[datetime]
    duration_minutes: int
    reason: Optional[str]
    notes: Optional[str]
    video_link: Optional[str]
    created_at: datetime
    updated_at: datetime


class AvailableSlot(BaseModel):
    """Available appointment slot schema."""
    date: datetime
    duration_minutes: int
    slot_type: str  # morning, afternoon, evening
    available: bool = True

"""Medication schemas."""
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class MedicationCreate(BaseModel):
    """Create medication schema."""
    medication_name: str = Field(..., min_length=1, max_length=255)
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None
    started_at: Optional[date] = None
    reminder_enabled: bool = False
    reminder_times: Optional[List[str]] = None  # ["08:00", "20:00"]


class MedicationUpdate(BaseModel):
    """Update medication schema."""
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None
    ended_at: Optional[date] = None
    is_active: Optional[bool] = None
    reminder_enabled: Optional[bool] = None
    reminder_times: Optional[List[str]] = None


class MedicationResponse(BaseModel):
    """Medication response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medication_name: str
    dosage: Optional[str]
    frequency: Optional[str]
    instructions: Optional[str]
    started_at: Optional[date]
    ended_at: Optional[date]
    is_active: bool
    reminder_enabled: bool
    reminder_times: Optional[List[str]]
    synced_from_clinic: bool
    created_at: datetime
    updated_at: datetime


class MedicationAdherenceCreate(BaseModel):
    """Create medication adherence log schema."""
    taken_at: Optional[datetime] = None
    skipped: bool = False
    skip_reason: Optional[str] = None


class MedicationAdherenceResponse(BaseModel):
    """Medication adherence response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medication_id: UUID
    scheduled_at: datetime
    taken_at: Optional[datetime]
    skipped: bool
    skip_reason: Optional[str]
    created_at: datetime


class MedicationAdherenceSummary(BaseModel):
    """Medication adherence summary."""
    medication_id: UUID
    medication_name: str
    total_doses: int
    taken_doses: int
    skipped_doses: int
    missed_doses: int
    adherence_rate: float  # 0-100%

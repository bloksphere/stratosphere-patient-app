"""Health measurement and symptom schemas."""
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator


class HealthMeasurementCreate(BaseModel):
    """Create health measurement schema."""
    measurement_type: str = Field(
        ...,
        description="Type: blood_pressure, glucose, weight, heart_rate, temperature, oxygen_saturation"
    )
    value_primary: Decimal = Field(..., description="Primary value (e.g., systolic BP, glucose level)")
    value_secondary: Optional[Decimal] = Field(None, description="Secondary value (e.g., diastolic BP)")
    unit: str = Field(..., description="Unit of measurement")
    measured_at: datetime
    notes: Optional[str] = None
    source: str = Field(default="manual", description="Source: manual, device_sync, imported")

    @field_validator("measurement_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        """Validate measurement type."""
        valid_types = [
            "blood_pressure", "glucose", "weight", "heart_rate",
            "temperature", "oxygen_saturation"
        ]
        if v not in valid_types:
            raise ValueError(f"Invalid measurement type. Must be one of: {valid_types}")
        return v


class HealthMeasurementUpdate(BaseModel):
    """Update health measurement schema."""
    value_primary: Optional[Decimal] = None
    value_secondary: Optional[Decimal] = None
    unit: Optional[str] = None
    measured_at: Optional[datetime] = None
    notes: Optional[str] = None


class HealthMeasurementResponse(BaseModel):
    """Health measurement response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    measurement_type: str
    value_primary: Decimal
    value_secondary: Optional[Decimal]
    unit: str
    measured_at: datetime
    notes: Optional[str]
    source: str
    synced_to_clinic: bool
    created_at: datetime


class SymptomCreate(BaseModel):
    """Create symptom schema."""
    symptom_type: str = Field(..., min_length=1, max_length=100)
    severity: Optional[int] = Field(None, ge=1, le=10, description="Severity 1-10")
    duration_minutes: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    reported_at: datetime


class SymptomResponse(BaseModel):
    """Symptom response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    symptom_type: str
    severity: Optional[int]
    duration_minutes: Optional[int]
    notes: Optional[str]
    reported_at: datetime
    synced_to_clinic: bool
    created_at: datetime


class HealthSummary(BaseModel):
    """Health summary for dashboard."""
    latest_blood_pressure: Optional[dict] = None
    latest_glucose: Optional[dict] = None
    latest_weight: Optional[dict] = None
    latest_heart_rate: Optional[dict] = None
    recent_symptoms: List[SymptomResponse] = []
    alerts: List[str] = []
    next_recommended_measurements: List[str] = []


class HealthTrendDataPoint(BaseModel):
    """Single data point for health trends."""
    date: datetime
    value: Decimal
    value_secondary: Optional[Decimal] = None


class HealthTrend(BaseModel):
    """Health trend data for charts."""
    measurement_type: str
    unit: str
    data_points: List[HealthTrendDataPoint]
    average: Optional[Decimal] = None
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None
    trend: str = "stable"  # improving, stable, declining

from fastapi import APIRouter, Query
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from decimal import Decimal

router = APIRouter()


class HealthMeasurementCreate(BaseModel):
    measurement_type: str  # blood_pressure, glucose, weight, heart_rate, etc.
    value_primary: Decimal
    value_secondary: Decimal | None = None
    unit: str
    measured_at: datetime
    notes: str | None = None


class HealthMeasurementResponse(BaseModel):
    id: UUID
    measurement_type: str
    value_primary: Decimal
    value_secondary: Decimal | None
    unit: str
    measured_at: datetime
    created_at: datetime


class SymptomCreate(BaseModel):
    symptom_type: str
    severity: int | None = None  # 1-10
    duration_minutes: int | None = None
    notes: str | None = None
    reported_at: datetime


@router.get("/measurements")
async def list_measurements(
    measurement_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = Query(default=20, le=100),
    offset: int = 0,
):
    """List health measurements with optional filters"""
    return {"measurements": [], "total": 0}


@router.post("/measurements", response_model=HealthMeasurementResponse)
async def create_measurement(request: HealthMeasurementCreate):
    """Add a new health measurement"""
    return HealthMeasurementResponse(
        id=UUID("00000000-0000-0000-0000-000000000000"),
        measurement_type=request.measurement_type,
        value_primary=request.value_primary,
        value_secondary=request.value_secondary,
        unit=request.unit,
        measured_at=request.measured_at,
        created_at=datetime.utcnow(),
    )


@router.get("/measurements/{measurement_id}")
async def get_measurement(measurement_id: UUID):
    """Get a specific measurement"""
    return {"id": measurement_id}


@router.delete("/measurements/{measurement_id}")
async def delete_measurement(measurement_id: UUID):
    """Delete a measurement"""
    return {"message": "Measurement deleted"}


@router.get("/summary")
async def get_health_summary():
    """Get health summary/dashboard data"""
    return {
        "latest_blood_pressure": {"systolic": 120, "diastolic": 80, "measured_at": datetime.utcnow()},
        "latest_glucose": {"value": 98, "unit": "mg/dL", "measured_at": datetime.utcnow()},
        "latest_weight": {"value": 72.5, "unit": "kg", "measured_at": datetime.utcnow()},
    }


@router.get("/trends")
async def get_health_trends(
    measurement_type: str,
    days: int = Query(default=30, le=365),
):
    """Get trend data for charts"""
    return {"data": [], "measurement_type": measurement_type, "period_days": days}


@router.get("/symptoms")
async def list_symptoms(limit: int = Query(default=20, le=100)):
    """List symptoms"""
    return {"symptoms": [], "total": 0}


@router.post("/symptoms")
async def log_symptom(request: SymptomCreate):
    """Log a symptom"""
    return {"id": UUID("00000000-0000-0000-0000-000000000000"), **request.model_dump()}


@router.delete("/symptoms/{symptom_id}")
async def delete_symptom(symptom_id: UUID):
    """Delete a symptom"""
    return {"message": "Symptom deleted"}

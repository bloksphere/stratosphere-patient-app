from fastapi import APIRouter, Query
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date

router = APIRouter()


class AppointmentCreate(BaseModel):
    appointment_type: str  # routine, follow_up, urgent, phone, video
    reason: str | None = None
    preferred_date: date | None = None
    preferred_time: str | None = None  # morning, afternoon, evening


class AppointmentResponse(BaseModel):
    id: UUID
    appointment_type: str
    status: str
    scheduled_at: datetime | None
    duration_minutes: int
    created_at: datetime


@router.get("/")
async def list_appointments(
    status: str | None = None,
    limit: int = Query(default=20, le=100),
):
    """List appointments"""
    return {"appointments": [], "total": 0}


@router.post("/", response_model=AppointmentResponse)
async def request_appointment(request: AppointmentCreate):
    """Request a new appointment"""
    return AppointmentResponse(
        id=UUID("00000000-0000-0000-0000-000000000000"),
        appointment_type=request.appointment_type,
        status="requested",
        scheduled_at=None,
        duration_minutes=15,
        created_at=datetime.utcnow(),
    )


@router.get("/available-slots")
async def get_available_slots(
    start_date: date,
    end_date: date | None = None,
    appointment_type: str = "routine",
):
    """Get available appointment slots"""
    return {"slots": []}


@router.get("/{appointment_id}")
async def get_appointment(appointment_id: UUID):
    """Get appointment details"""
    return {"id": appointment_id}


@router.put("/{appointment_id}")
async def update_appointment(appointment_id: UUID, scheduled_at: datetime | None = None):
    """Update/reschedule appointment"""
    return {"id": appointment_id, "message": "Appointment updated"}


@router.delete("/{appointment_id}")
async def cancel_appointment(appointment_id: UUID):
    """Cancel appointment"""
    return {"message": "Appointment cancelled"}

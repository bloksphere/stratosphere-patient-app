import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, LargeBinary, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    clinic_appointment_id = Column(UUID(as_uuid=True), nullable=True)
    
    appointment_type = Column(String(50), nullable=False)  # routine, follow_up, urgent, phone, video
    status = Column(String(20), default="requested")  # requested, confirmed, cancelled, completed, no_show
    
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=15)
    
    reason_encrypted = Column(LargeBinary, nullable=True)
    notes_encrypted = Column(LargeBinary, nullable=True)
    video_link_encrypted = Column(LargeBinary, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

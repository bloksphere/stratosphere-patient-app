import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, LargeBinary, Numeric, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class HealthMeasurement(Base):
    __tablename__ = "health_measurements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    measurement_type = Column(String(50), nullable=False)  # blood_pressure, glucose, weight, etc.
    
    value_primary = Column(Numeric(10, 2), nullable=True)  # systolic BP, glucose, weight
    value_secondary = Column(Numeric(10, 2), nullable=True)  # diastolic BP
    unit = Column(String(20), nullable=False)
    
    measured_at = Column(DateTime, nullable=False)
    notes_encrypted = Column(LargeBinary, nullable=True)
    source = Column(String(50), default="manual")
    device_id = Column(UUID(as_uuid=True), nullable=True)
    
    synced_to_clinic = Column(Boolean, default=False)
    synced_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    symptom_type = Column(String(100), nullable=False)
    severity = Column(Integer, nullable=True)  # 1-10
    duration_minutes = Column(Integer, nullable=True)
    notes_encrypted = Column(LargeBinary, nullable=True)
    reported_at = Column(DateTime, nullable=False)
    synced_to_clinic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

"""Health measurement and symptom models."""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, DateTime, ForeignKey, Numeric, Boolean, LargeBinary, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID


class HealthMeasurement(Base):
    """Model for patient-submitted health measurements."""

    __tablename__ = "health_measurements"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Measurement type: blood_pressure, glucose, weight, heart_rate, temperature, oxygen_saturation
    measurement_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Values
    value_primary: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    value_secondary: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)

    # Context
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    notes_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual, device_sync, imported
    device_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), nullable=True)

    # Sync status with clinic
    synced_to_clinic: Mapped[bool] = mapped_column(Boolean, default=False)
    synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="health_measurements")

    def __repr__(self) -> str:
        return f"<HealthMeasurement {self.measurement_type} at {self.measured_at}>"


class Symptom(Base):
    """Model for patient-reported symptoms."""

    __tablename__ = "symptoms"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    symptom_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-10 scale
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)

    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    synced_to_clinic: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="symptoms")

    def __repr__(self) -> str:
        return f"<Symptom {self.symptom_type} severity={self.severity}>"

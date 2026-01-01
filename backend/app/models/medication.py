"""Medication tracking models."""
import uuid
from datetime import datetime, date
from typing import Optional

from sqlalchemy import String, DateTime, Date, ForeignKey, LargeBinary, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, JSONType


class PatientMedication(Base):
    """Model for patient medications and tracking."""

    __tablename__ = "patient_medications"

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

    # Medication info
    medication_name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    frequency: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    instructions_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)

    # Duration
    started_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    ended_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Reminders
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_times: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)  # ["08:00", "20:00"]

    # Sync status
    synced_from_clinic: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="medications")
    adherence_logs = relationship(
        "MedicationAdherence",
        back_populates="medication",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<PatientMedication {self.medication_name}>"


class MedicationAdherence(Base):
    """Model for tracking medication adherence."""

    __tablename__ = "medication_adherence"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4
    )

    medication_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("patient_medications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    taken_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    skipped: Mapped[bool] = mapped_column(Boolean, default=False)
    skip_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # Relationships
    medication = relationship("PatientMedication", back_populates="adherence_logs")

    def __repr__(self) -> str:
        return f"<MedicationAdherence {self.medication_id} at {self.scheduled_at}>"

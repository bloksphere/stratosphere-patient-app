"""Document model for storing patient documents."""
import uuid
from datetime import datetime, date
from typing import Optional

from sqlalchemy import String, DateTime, Date, ForeignKey, LargeBinary, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID


class Document(Base):
    """Model for patient documents (prescriptions, test results, letters)."""

    __tablename__ = "documents"

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

    # Document info
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: prescription, test_result, letter, discharge_summary, referral

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)

    # File storage
    s3_key_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)

    # Date info
    issued_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Sync status
    synced_from_clinic: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document {self.title}>"

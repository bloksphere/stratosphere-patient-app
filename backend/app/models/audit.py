"""Audit log model for GDPR compliance."""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, GUID, JSONType


class AuditLog(Base):
    """Model for audit logging (GDPR requirement)."""

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4
    )

    # User who performed the action (can be null for system actions)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), nullable=True, index=True)

    # Action performed
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # Actions: login, logout, login_failed, view_record, update_profile,
    # export_data, delete_data, consent_given, consent_withdrawn,
    # password_changed, mfa_enabled, mfa_disabled, etc.

    # Resource affected
    resource_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    resource_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID(), nullable=True)

    # Request info
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Additional context
    details: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        index=True
    )

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} by {self.user_id}>"

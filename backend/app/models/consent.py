import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, LargeBinary, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET
from app.database import Base


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    consent_type = Column(String(50), nullable=False)  # terms_of_service, privacy_policy, etc.
    version = Column(String(20), nullable=False)
    
    granted = Column(Boolean, nullable=False)
    granted_at = Column(DateTime, nullable=True)
    withdrawn_at = Column(DateTime, nullable=True)
    
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DataRequest(Base):
    __tablename__ = "data_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    request_type = Column(String(50), nullable=False)  # export, delete, rectify
    status = Column(String(20), default="pending")  # pending, processing, completed, rejected
    
    requested_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    download_link_encrypted = Column(LargeBinary, nullable=True)
    download_expires_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, nullable=True)

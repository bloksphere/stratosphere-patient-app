import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False)
    phone = Column(String(20), nullable=True)
    phone_verified = Column(Boolean, default=False)
    password_hash = Column(String(255), nullable=False)
    
    # Link to clinic EMR
    nhs_number = Column(String(20), unique=True, nullable=True)
    clinic_patient_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Profile (encrypted)
    first_name_encrypted = Column(LargeBinary, nullable=False)
    last_name_encrypted = Column(LargeBinary, nullable=False)
    date_of_birth_encrypted = Column(LargeBinary, nullable=True)
    
    # Account status
    status = Column(String(20), default="pending_verification")
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret_encrypted = Column(LargeBinary, nullable=True)
    
    # GDPR
    gdpr_consent_date = Column(DateTime, nullable=True)
    data_processing_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

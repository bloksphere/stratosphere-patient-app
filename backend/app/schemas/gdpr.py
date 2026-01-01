"""GDPR-related schemas."""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ConsentUpdate(BaseModel):
    """Update consent preferences schema."""
    data_processing_consent: Optional[bool] = None
    marketing_consent: Optional[bool] = None


class ConsentRecordResponse(BaseModel):
    """Consent record response schema."""
    model_config = ConfigDict(from_attributes=True)

    consent_type: str
    version: str
    granted: bool
    granted_at: Optional[datetime]
    withdrawn_at: Optional[datetime]


class ConsentResponse(BaseModel):
    """Full consent status response."""
    terms_of_service: ConsentRecordResponse
    privacy_policy: ConsentRecordResponse
    data_processing: ConsentRecordResponse
    marketing: ConsentRecordResponse


class DataExportRequest(BaseModel):
    """Request data export schema."""
    include_health_data: bool = True
    include_messages: bool = True
    include_appointments: bool = True
    include_documents: bool = True
    format: str = "json"  # json, pdf


class DataExportResponse(BaseModel):
    """Data export response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    request_type: str
    status: str
    requested_at: datetime
    completed_at: Optional[datetime]
    download_url: Optional[str]
    download_expires_at: Optional[datetime]


class AuditLogResponse(BaseModel):
    """Audit log response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    action: str
    resource_type: Optional[str]
    ip_address: Optional[str]
    created_at: datetime


class DataDeletionRequest(BaseModel):
    """Request account/data deletion schema."""
    confirm_email: str
    reason: Optional[str] = None
    confirm_deletion: bool = False

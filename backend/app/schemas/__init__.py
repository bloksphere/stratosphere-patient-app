"""Pydantic schemas for request/response validation."""
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    TokenRefreshRequest,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    ChangePasswordRequest,
    VerifyEmailRequest,
    MFAEnableRequest,
    MFAVerifyRequest
)
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserProfile,
    LinkNHSRequest
)
from app.schemas.health import (
    HealthMeasurementCreate,
    HealthMeasurementUpdate,
    HealthMeasurementResponse,
    SymptomCreate,
    SymptomResponse,
    HealthSummary,
    HealthTrend
)
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AvailableSlot
)
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    MessageThreadResponse
)
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    MedicationAdherenceCreate,
    MedicationAdherenceResponse
)
from app.schemas.gdpr import (
    ConsentUpdate,
    ConsentResponse,
    DataExportRequest,
    DataExportResponse
)
from app.schemas.common import (
    PaginatedResponse,
    SuccessResponse,
    ErrorResponse
)

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse",
    "RegisterRequest",
    "TokenRefreshRequest",
    "TokenResponse",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    "ChangePasswordRequest",
    "VerifyEmailRequest",
    "MFAEnableRequest",
    "MFAVerifyRequest",
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserProfile",
    "LinkNHSRequest",
    # Health
    "HealthMeasurementCreate",
    "HealthMeasurementUpdate",
    "HealthMeasurementResponse",
    "SymptomCreate",
    "SymptomResponse",
    "HealthSummary",
    "HealthTrend",
    # Appointment
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "AvailableSlot",
    # Message
    "MessageCreate",
    "MessageResponse",
    "MessageThreadResponse",
    # Medication
    "MedicationCreate",
    "MedicationUpdate",
    "MedicationResponse",
    "MedicationAdherenceCreate",
    "MedicationAdherenceResponse",
    # GDPR
    "ConsentUpdate",
    "ConsentResponse",
    "DataExportRequest",
    "DataExportResponse",
    # Common
    "PaginatedResponse",
    "SuccessResponse",
    "ErrorResponse"
]

"""Custom exceptions for the application."""
from typing import Optional, Any, Dict


class AppException(Exception):
    """Base exception for application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=401, details=details)


class AuthorizationError(AppException):
    """Raised when user is not authorized to perform action."""

    def __init__(
        self,
        message: str = "Not authorized to perform this action",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=403, details=details)


class NotFoundError(AppException):
    """Raised when a resource is not found."""

    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=404, details=details)


class ValidationError(AppException):
    """Raised when validation fails."""

    def __init__(
        self,
        message: str = "Validation error",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=422, details=details)


class RateLimitError(AppException):
    """Raised when rate limit is exceeded."""

    def __init__(
        self,
        message: str = "Rate limit exceeded. Please try again later.",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=429, details=details)


class ConflictError(AppException):
    """Raised when there's a conflict (e.g., duplicate email)."""

    def __init__(
        self,
        message: str = "Resource already exists",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=409, details=details)


class ServiceUnavailableError(AppException):
    """Raised when an external service is unavailable."""

    def __init__(
        self,
        message: str = "Service temporarily unavailable",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status_code=503, details=details)

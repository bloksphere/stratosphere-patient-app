"""Common schemas used across the application."""
from typing import TypeVar, Generic, List, Optional, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class SuccessResponse(BaseModel):
    """Standard success response."""
    success: bool = True
    message: str = "Operation completed successfully"


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    details: Optional[dict] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""
    model_config = ConfigDict(from_attributes=True)

    items: List[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        size: int
    ) -> "PaginatedResponse[T]":
        """Create paginated response."""
        pages = (total + size - 1) // size if size > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )

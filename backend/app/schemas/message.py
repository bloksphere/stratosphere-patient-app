"""Message schemas."""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class MessageCreate(BaseModel):
    """Create message schema."""
    subject: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1, max_length=5000)
    parent_message_id: Optional[UUID] = None


class MessageAttachmentResponse(BaseModel):
    """Message attachment response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    file_type: str
    file_size: int
    created_at: datetime


class MessageResponse(BaseModel):
    """Message response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    direction: str
    subject: str
    body: str
    status: str
    read_at: Optional[datetime]
    has_attachments: bool
    attachments: List[MessageAttachmentResponse] = []
    created_at: datetime


class MessageThreadResponse(BaseModel):
    """Message thread response schema."""
    model_config = ConfigDict(from_attributes=True)

    thread_id: UUID
    subject: str
    last_message_at: datetime
    unread_count: int
    messages: List[MessageResponse] = []

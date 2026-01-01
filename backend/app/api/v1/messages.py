from fastapi import APIRouter, Query, UploadFile, File
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter()


class MessageCreate(BaseModel):
    subject: str
    body: str


class MessageResponse(BaseModel):
    id: UUID
    direction: str
    subject: str
    body: str
    status: str
    created_at: datetime


@router.get("/")
async def list_messages(limit: int = Query(default=20, le=100)):
    """List message threads"""
    return {"messages": [], "total": 0}


@router.post("/", response_model=MessageResponse)
async def send_message(request: MessageCreate):
    """Send a new message to clinic"""
    return MessageResponse(
        id=UUID("00000000-0000-0000-0000-000000000000"),
        direction="inbound",
        subject=request.subject,
        body=request.body,
        status="sent",
        created_at=datetime.utcnow(),
    )


@router.get("/{message_id}")
async def get_message(message_id: UUID):
    """Get message thread"""
    return {"id": message_id}


@router.post("/{message_id}/reply")
async def reply_to_message(message_id: UUID, body: str):
    """Reply to a message"""
    return {"message": "Reply sent", "parent_id": message_id}


@router.put("/{message_id}/read")
async def mark_as_read(message_id: UUID):
    """Mark message as read"""
    return {"message": "Marked as read"}


@router.post("/{message_id}/attachments")
async def upload_attachment(message_id: UUID, file: UploadFile = File(...)):
    """Upload attachment to message"""
    return {"message": "Attachment uploaded", "filename": file.filename}


@router.get("/{message_id}/attachments/{attachment_id}")
async def download_attachment(message_id: UUID, attachment_id: UUID):
    """Download attachment"""
    return {"message": "Download URL", "url": ""}

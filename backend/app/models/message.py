import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, LargeBinary, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    direction = Column(String(10), nullable=False)  # inbound, outbound
    subject_encrypted = Column(LargeBinary, nullable=False)
    body_encrypted = Column(LargeBinary, nullable=False)
    
    parent_message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=True)
    thread_id = Column(UUID(as_uuid=True), nullable=True)
    
    status = Column(String(20), default="sent")  # draft, sent, delivered, read
    read_at = Column(DateTime, nullable=True)
    has_attachments = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class MessageAttachment(Base):
    __tablename__ = "message_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    s3_key_encrypted = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

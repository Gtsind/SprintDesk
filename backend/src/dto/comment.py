from sqlmodel import SQLModel, Field
from src.models.base import CommentBase
from src.dto.user import UserSummary
from datetime import datetime

class CommentCreate(CommentBase):
    """DTO for comment creation"""
    issue_id: int

class CommentUpdate(SQLModel):
    """DTO for comment updates"""
    content: str | None = None

class CommentPublic(CommentBase):
    """DTO for comment responses"""
    id: int
    issue_id: int
    author_id: int
    created_at: datetime
    author: "UserSummary"
    
    class Config:
        from_attributes = True
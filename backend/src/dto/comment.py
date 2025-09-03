from sqlmodel import SQLModel
from src.models.base import CommentBase
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.dto.user import UserSummary

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

from src.dto.user import UserSummary

CommentPublic.model_rebuild()
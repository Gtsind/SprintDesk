from sqlmodel import Field, Relationship
from src.models.base import CommentBase
from datetime import datetime, timezone
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import User, Issue

class Comment(CommentBase, table=True):
    __tablename__:ClassVar[str] = "comments"

    id: int | None = Field(default=None, primary_key=True)
    issue_id: int = Field(foreign_key="issues.id", index=True, ondelete="CASCADE")
    author_id: int | None = Field(foreign_key="users.id", index=True, ondelete="SET NULL")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Relationships
    issue: "Issue" = Relationship(back_populates="comments")
    author: "User" = Relationship(back_populates="comments")
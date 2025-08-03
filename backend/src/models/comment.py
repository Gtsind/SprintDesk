from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import User, Issue

class Comment(SQLModel, table=True):
    __tablename__:ClassVar[str] = "comments"

    id: int | None = Field(default=None, primary_key=True)
    issue_id: int = Field(foreign_key="issues.id", index=True)
    author_id: int = Field(foreign_key="users.id")
    content: str = Field(max_length=2000)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Relationships
    issue: "Issue" = Relationship(back_populates="comments")
    author: "User" = Relationship(back_populates="comments")

    def __str__(self) -> str:
        return f"Comment by {self.author.username} on Issue #{self.issue_id}"
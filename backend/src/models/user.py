from sqlmodel import Field, Relationship
from src.models.base import UserBase
from datetime import datetime, timezone
from src.utils.enums import UserRole
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import Project, Issue, Comment, ProjectMembership

class User(UserBase, table=True):
    __tablename__: ClassVar[str] = "users"

    id: int | None = Field(default=None, primary_key=True)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    # Relationships
    created_projects: list["Project"] = Relationship(back_populates="creator")
    authored_issues: list["Issue"] = Relationship(
        back_populates="author",
        sa_relationship_kwargs={"foreign_keys": "Issue.author_id"}
        )
    assigned_issues: list["Issue"] = Relationship(
        back_populates="assignee",
        sa_relationship_kwargs={"foreign_keys": "Issue.assignee_id"}
    )
    closed_issues: list["Issue"] = Relationship(
        back_populates="closed_by_user",
        sa_relationship_kwargs={"foreign_keys": "Issue.closed_by"}
    )
    comments: list["Comment"] = Relationship(back_populates="author")
    project_memberships: list["ProjectMembership"] = Relationship(back_populates="user")
    
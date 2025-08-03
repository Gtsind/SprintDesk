from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from src.utils.enums import UserRole
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import Project, Issue, Comment, ProjectMembership

class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "users"

    id: int | None = Field(default=None, primary_key=True)
    firstname: str = Field(max_length=50)
    lastname: str = Field(max_length=50)
    username: str = Field(unique=True, max_length=50, index=True)
    password_hash: str = Field(max_length=255)
    email: str = Field(unique=True, max_length=100, index=True)
    role: UserRole = Field(nullable=False, default=UserRole.CONTRIBUTOR)
    title: str | None = Field(default=None, max_length=100)
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
        back_populates="closer",
        sa_relationship_kwargs={"foreign_keys": "Issue.closed_by"}
    )
    comments: list["Comment"] = Relationship(back_populates="author")
    project_memberships: list["ProjectMembership"] = Relationship(back_populates="user")

    def __str__(self) -> str:
        return f"{self.firstname} {self.lastname} ({self.username})"
    
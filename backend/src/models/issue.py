from sqlmodel import Relationship, Field
from src.models.base import IssueBase
from datetime import datetime, timezone
from typing import ClassVar, TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from src.models import User, Project, Comment, IssueLabel

class Issue(IssueBase, table=True):
    __tablename__: ClassVar[str] = "issues"

    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", nullable=False, index=True)
    author_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    assignee_id: int | None = Field(default=None, foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    closed_at: datetime | None = Field(default=None)
    closed_by: int | None = Field(default=None, foreign_key="users.id")
    # Relationships
    project: "Project" = Relationship(back_populates="issues")
    author: "User" = Relationship(
        back_populates="authored_issues",
        sa_relationship_kwargs={"foreign_keys": "Issue.author_id"}
        )
    assignee: Optional["User"] = Relationship(
        back_populates="assigned_issues",
        sa_relationship_kwargs={"foreign_keys": "Issue.assignee_id"}
    )
    closed_by_user: Optional["User"] = Relationship(
        back_populates="closed_issues",
        sa_relationship_kwargs={"foreign_keys": "Issue.closed_by"}
    )
    comments: list["Comment"] = Relationship(back_populates="issue")
    issue_labels: list["IssueLabel"] = Relationship(back_populates="issue")
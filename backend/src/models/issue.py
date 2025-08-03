from sqlmodel import Relationship, SQLModel, Field
from datetime import datetime, timezone
from typing import ClassVar, TYPE_CHECKING
from src.utils.enums import IssuePriority, IssueStatus

if TYPE_CHECKING:
    from src.models import User, Project, Comment, IssueLabel

class Issue(SQLModel, table=True):
    __tablename__: ClassVar[str] = "issues"

    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", nullable=False, index=True)
    title: str = Field(nullable=False, index=True, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    author_id: int = Field(foreign_key="users.id", nullable=False)
    assignee_id: int | None = Field(default=None, foreign_key="users.id")
    status: IssueStatus = Field(default=IssueStatus.OPEN, index=True)
    priority: IssuePriority = Field(default=IssuePriority.MEDIUM, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    closed_at: datetime | None = Field(default=None)
    closed_by: int | None = Field(default=None, foreign_key="users.id")
    time_estimate: int | None = Field(default=None, description="Estimated time in hours")
    # Relationships
    project: "Project" = Relationship(back_populates="issues")
    author: "User" = Relationship(
        back_populates="authored_issues",
        sa_relationship_kwargs={"foreign_keys": "Issue.author_id"}
        )
    assignee: "User | None" = Relationship(
        back_populates="assigned_issues",
        sa_relationship_kwargs={"foreign_keys": "Issue.assignee_id"}
    )
    closer: "User | None" = Relationship(
        back_populates="closed_issues",
        sa_relationship_kwargs={"foreign_keys": "Issue.closed_by"}
    )
    comments: list["Comment"] = Relationship(back_populates="issue")
    issue_labels: list["IssueLabel"] = Relationship(back_populates="issue")

    def __str__(self) -> str:
        return f"Issue #{self.id}: {self.title}"
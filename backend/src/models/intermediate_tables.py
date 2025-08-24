from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import User, Project, Issue, Label

class ProjectMembership(SQLModel, table=True):
    __tablename__: ClassVar[str] = "project_memberships"

    project_id: int | None = Field(default=None, foreign_key="projects.id", primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id", primary_key=True)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Relationships
    project: "Project" = Relationship(back_populates="memberships")
    user: "User" = Relationship(back_populates="project_memberships")

class IssueLabel(SQLModel, table=True):
    __tablename__: ClassVar[str] = "issue_labels"

    issue_id: int | None = Field(default=None, foreign_key="issues.id", primary_key=True)
    label_id: int | None = Field(default=None, foreign_key="labels.id", primary_key=True)
    # Relationships
    issue: "Issue" = Relationship(back_populates="issue_labels")
    label: "Label" = Relationship(back_populates="issue_labels")
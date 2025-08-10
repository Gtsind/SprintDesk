from sqlmodel import Relationship, Field
from datetime import datetime, timezone
from src.models.base import ProjectBase
from src.utils.enums import ProjectStatus
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import User, Issue, ProjectMembership

class Project(ProjectBase, table=True):
    __tablename__: ClassVar[str] = "projects"

    id: int | None = Field(default=None, primary_key=True)
    created_by: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Relationships
    creator: "User" = Relationship(back_populates="created_projects")
    issues: list["Issue"] = Relationship(back_populates="project")
    memberships: list["ProjectMembership"] = Relationship(back_populates="project")
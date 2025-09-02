from sqlmodel import Relationship, Field
from datetime import datetime, timezone
from src.models.base import ProjectBase
from src.models.intermediate_tables import ProjectMembership
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import User, Issue, ProjectMembership

class Project(ProjectBase, table=True):
    __tablename__: ClassVar[str] = "projects"

    id: int | None = Field(default=None, primary_key=True)
    created_by: int | None = Field(foreign_key="users.id", index=True, ondelete="SET NULL")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Relationships
    creator: "User" = Relationship(back_populates="created_projects")
    issues: list["Issue"] = Relationship(back_populates="project", cascade_delete=True)
    memberships: list["ProjectMembership"] = Relationship(back_populates="project", cascade_delete=True)
    members: list["User"] = Relationship(back_populates="projects", link_model=ProjectMembership)
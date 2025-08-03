from sqlmodel import Relationship, SQLModel, Field
from datetime import datetime, timezone
from src.utils.enums import ProjectStatus
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import User, Issue, ProjectMembership

class Project(SQLModel, table=True):
    __tablename__: ClassVar[str] = "projects"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: int = Field(foreign_key="users.id", nullable=False)
    status: ProjectStatus = Field(nullable=False)
    # Relationships
    creator: "User" = Relationship(back_populates="created_projects")
    issues: list["Issue"] = Relationship(back_populates="project")
    memberships: list["ProjectMembership"] = Relationship(back_populates="project")

    def __str__(self) -> str:
        return f"Project: {self.name}"
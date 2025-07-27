from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import enum

class ProjectStatus(str, enum.Enum):
    ongoing = "ongoing"
    completed = "completed"

class Project(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: int = Field(foreign_key="user.id", nullable=False)
    status: ProjectStatus = Field(nullable=False)
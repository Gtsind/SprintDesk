from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

class Issue(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", nullable=False)
    title: str = Field(nullable=False, index=True)
    description: str | None = Field(default=None)
    author_id: int = Field(foreign_key="user.id", nullable=False)
    assignee_id: str | None = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    closed_at: datetime | None = Field(default=None)
    closed_by: int | None = Field(default=None, foreign_key="user.id")
    time_estimate: int | None = Field(default=None, description="Estimated time in hours")
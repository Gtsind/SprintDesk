from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

class Project_membership(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", nullable=False)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    project_manager = "project_manager"
    contributor = "contributor"

class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    firstname: str
    lastname: str
    username: str = Field(unique=True, index=True)
    password_hash: str
    email: str = Field(unique=True, index=True)
    role: UserRole = Field(nullable=False)
    title: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: UserStatus = Field(default=UserStatus.active)
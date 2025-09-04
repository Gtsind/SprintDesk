from sqlmodel import SQLModel, Field
from src.models.base import UserBase
from src.models.enums import UserRole
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.dto.project import ProjectSummary
    from src.dto.issue import IssueSummary

class UserCreate(UserBase):
    """DTO for user creation"""
    password: str = Field(min_length=8, max_length=100)
    is_active: bool = Field(default=True)

class UserUpdate(SQLModel):
    """DTO for user updates"""
    firstname: str | None = None
    lastname: str | None = None
    username: str | None = None
    email: str | None = None
    title: str | None = None
    role: UserRole | None = None
    password: str | None = None
    is_active: bool | None = None

class UserPublic(UserBase):
    """DTO for user responses"""
    id: int
    is_active: bool
    created_at: datetime
    projects: list["ProjectSummary"] = []
    assigned_issues: list["IssueSummary"] = []

class UserSummary(UserBase):
    """DTO for minimal user info"""
    id: int
    is_active: bool | None = None

# We need to import this to avoid "not fully defined" errors when using forward reference
from src.dto.project import ProjectSummary
from src.dto.issue import IssueSummary
UserPublic.model_rebuild()

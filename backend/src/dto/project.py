from sqlmodel import SQLModel
from src.models.base import ProjectBase
from src.models.enums import ProjectStatus
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.dto.issue import IssueSummary
    from src.dto.user import UserSummary

class ProjectCreate(ProjectBase):
    """DTO for project creation"""
    pass

class ProjectUpdate(SQLModel):
    """DTO for project updates"""
    name: str | None = None
    description: str | None = None
    status: ProjectStatus | None = None

class ProjectPublic(ProjectBase):
    """DTO for project responses"""
    id: int
    created_by: int
    created_at: datetime
    creator: "UserSummary"
    members: list["UserSummary"] = []
    issues: list["IssueSummary"] = []

class ProjectSummary(SQLModel):
    """DTO for minimal project info"""
    id: int
    name: str
    status: ProjectStatus

# We need to import this to avoid "not fully defined" errors when using forward reference
from src.dto.issue import IssueSummary
from src.dto.user import UserSummary
ProjectPublic.model_rebuild()
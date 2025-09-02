from sqlmodel import SQLModel
from src.models.base import ProjectBase
from src.models.enums import ProjectStatus
from src.dto.user import UserSummary
from datetime import datetime

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

class ProjectSummary(SQLModel):
    """DTO for minimal project info"""
    id: int
    name: str
    status: ProjectStatus
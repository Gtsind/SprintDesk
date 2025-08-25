from sqlmodel import SQLModel
from src.models.base import IssueBase
from src.models import IssueStatus, IssuePriority
from src.dto.user import UserSummary
from src.dto.project import ProjectSummary
from datetime import datetime

class IssueCreate(IssueBase):
    """DTO for issue creation"""
    project_id: int
    assignee_id: int | None = None

class IssueUpdate(SQLModel):
    """DTO for issue updates"""
    title: str | None = None
    description: str | None = None
    status: IssueStatus | None = None
    priority: IssuePriority | None = None
    assignee_id: int | None = None
    time_estimate: int | None = None

class IssuePublic(IssueBase):
    """DTO for issue responses"""
    id: int
    project_id: int
    author_id: int
    assignee_id: int | None
    closed_by: int | None
    created_at: datetime
    updated_at: datetime | None
    closed_at: datetime | None
    author: "UserSummary"
    assignee: "UserSummary | None"
    project: "ProjectSummary"

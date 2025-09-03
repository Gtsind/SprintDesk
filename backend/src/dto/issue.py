from sqlmodel import SQLModel
from src.models.base import IssueBase
from src.models import IssueStatus, IssuePriority
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.dto.user import UserSummary
    from src.dto.project import ProjectSummary
    from src.dto.comment import CommentPublic

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
    author_id: int | None
    assignee_id: int | None
    closed_by: int | None
    created_at: datetime
    updated_at: datetime | None
    closed_at: datetime | None
    author: "UserSummary | None"
    assignee: "UserSummary | None"
    project: "ProjectSummary"
    comments: list["CommentPublic"] | None

class IssueSummary(IssueBase):
    """DTO for minimal issue responses"""
    id: int


from src.dto.user import UserSummary
from src.dto.project import ProjectSummary
from src.dto.comment import CommentPublic

IssuePublic.model_rebuild()

from datetime import datetime, timezone
from sqlmodel import Session, select
from utils.enums import IssueStatus
from models.issue import Issue
from models.intermediate_tables import IssueLabel
from dto.issue import IssueCreate, IssueUpdate
from .base_repository import BaseRepository


class IssueRepository(BaseRepository[Issue]):
    """Repository for Issue operations"""
    
    def __init__(self, session: Session):
        super().__init__(Issue, session)

    def create(self, issue_create: IssueCreate, author_id: int) -> Issue:
        """Create a new issue"""
        issue_data = issue_create.model_dump()
        issue_data["author_id"] = author_id
        db_issue = Issue(**issue_data)
        self.session.add(db_issue)
        self.session.commit()
        self.session.refresh(db_issue)
        return db_issue

    def update(self, issue_id: int, issue_update: IssueUpdate) -> Issue | None:
        """Update existing issue"""
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return None
        
        update_data = issue_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        for field, value in update_data.items():
            setattr(db_issue, field, value)
        
        self.session.add(db_issue)
        self.session.commit()
        self.session.refresh(db_issue)
        return db_issue

    def get_issues_by_project(self, project_id: int) -> list[Issue]:
        """Get issues by project"""
        return self.get_all_by_field("project_id", project_id)

    def get_issues_by_author(self, author_id: int) -> list[Issue]:
        """Get issues created by a specific user"""
        return self.get_all_by_field("author_id", author_id)

    def get_issues_by_assignee(self, assignee_id: int) -> list[Issue]:
        """Get issues assigned to a specific user"""
        return self.get_all_by_field("assignee_id", assignee_id)

    def get_issues_by_status(self, status: str) -> list[Issue]:
        """Get issues by status"""
        return self.get_all_by_field("status", status)

    def get_issues_by_priority(self, priority: str) -> list[Issue]:
        """Get issues by priority"""
        return self.get_all_by_field("priority", priority)

    def assign_issue(self, issue_id: int, assignee_id: int | None) -> Issue | None:
        """Assign or unassign an issue"""
        issue_update = IssueUpdate(assignee_id=assignee_id)
        return self.update(issue_id, issue_update)

    def close_issue(self, issue_id: int, closed_by_user_id: int) -> Issue | None:
        """Close an issue"""
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return None
        
        db_issue.status = IssueStatus.CLOSED
        db_issue.closed_at = datetime.now(timezone.utc)
        db_issue.closed_by = closed_by_user_id
        db_issue.updated_at = datetime.now(timezone.utc)
        
        self.session.add(db_issue)
        self.session.commit()
        self.session.refresh(db_issue)
        return db_issue

    def reopen_issue(self, issue_id: int) -> Issue | None:
        """Reopen a closed issue"""
        db_issue = self.get_by_id(issue_id)
        if not db_issue:
            return None
        
        db_issue.status = IssueStatus.OPEN
        db_issue.closed_at = None
        db_issue.closed_by = None
        db_issue.updated_at = datetime.now(timezone.utc)
        
        self.session.add(db_issue)
        self.session.commit()
        self.session.refresh(db_issue)
        return db_issue

    def add_label_to_issue(self, issue_id: int, label_id: int) -> IssueLabel:
        """Add a label to an issue"""
        issue_label = IssueLabel(issue_id=issue_id, label_id=label_id)
        self.session.add(issue_label)
        self.session.commit()
        self.session.refresh(issue_label)
        return issue_label

    def remove_label_from_issue(self, issue_id: int, label_id: int) -> bool:
        """Remove a label from an issue"""
        statement = select(IssueLabel).where(
            IssueLabel.issue_id == issue_id,
            IssueLabel.label_id == label_id
        )
        issue_label = self.session.exec(statement).first()
        if issue_label:
            self.session.delete(issue_label)
            self.session.commit()
            return True
        return False

    def get_issue_labels(self, issue_id: int) -> list[IssueLabel]:
        """Get all labels for an issue"""
        statement = select(IssueLabel).where(IssueLabel.issue_id == issue_id)
        return list(self.session.exec(statement).all())
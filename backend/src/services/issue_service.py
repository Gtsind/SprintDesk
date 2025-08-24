from fastapi import HTTPException, status
from src.dto.issue import IssueCreate, IssueUpdate, IssuePublic
from src.repositories.issue_repository import IssueRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.user_repository import UserRepository
from src.utils.enums import UserRole

class IssueService:
    """Service for issue operations"""
    
    def __init__(self, issue_repository: IssueRepository, project_repository: ProjectRepository, user_repository: UserRepository):
        self.issue_repository = issue_repository
        self.project_repository = project_repository
        self.user_repository = user_repository

    def create_issue(self, issue_create: IssueCreate, current_user_id: int, current_user_role: UserRole) -> IssuePublic:
        """Create a new issue"""
        # Check if project exists
        project = self.project_repository.get_by_id(issue_create.project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
        
        # Check if user can create issues in this project
        if not self._can_create_issue_in_project(issue_create.project_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create issue in this project.")
        
        # Validate assignee if provided
        if issue_create.assignee_id:
            if not self._can_assign_to_user(issue_create.project_id, issue_create.assignee_id, current_user_id, current_user_role):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign this user.")
        
        db_issue = self.issue_repository.create(issue_create, current_user_id)
        return IssuePublic.model_validate(db_issue)

    def get_issue_by_id(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> IssuePublic:
        """Get issue by ID"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        # Check if user can view this issue
        if not self._can_view_issue(issue.project_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view this issue.")
        
        return IssuePublic.model_validate(issue)

    def get_all_issues(self, current_user_id: int, current_user_role: UserRole) -> list[IssuePublic]:
        """Get all issues based on user role and permissions"""
        if current_user_role == UserRole.ADMIN:
            # Admin can see all issues
            issues = self.issue_repository.get_all()
        else:
            # Get user's project issues
            user_projects = self.project_repository.get_user_projects(current_user_id)
            if current_user_role == UserRole.PROJECT_MANAGER:
                # Add projects created by PM
                created_projects = self.project_repository.get_projects_by_creator(current_user_id)
                # Combine and deduplicate
                all_projects = {p.id: p for p in user_projects + created_projects}.values()
            else:
                all_projects = user_projects
            
            issues = []
            for project in all_projects:
                project_issues = self.issue_repository.get_issues_by_project(project.id) # type: ignore
                issues.extend(project_issues)
        
        return [IssuePublic.model_validate(issue) for issue in issues]

    def get_issues_by_project(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> list[IssuePublic]:
        """Get issues by project"""
        if not self._can_view_issue(project_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view this issue.")
        
        issues = self.issue_repository.get_issues_by_project(project_id)
        return [IssuePublic.model_validate(issue) for issue in issues]

    def update_issue(self, issue_id: int, issue_update: IssueUpdate, current_user_id: int, current_user_role: UserRole) -> IssuePublic:
        """Update issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        if not self._can_update_issue(issue, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this issue.")
        
        # Validate assignee if being updated
        if hasattr(issue_update, 'assignee_id') and issue_update.assignee_id is not None:
            if not self._can_assign_to_user(issue.project_id, issue_update.assignee_id, current_user_id, current_user_role):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign this user.")
        
        updated_issue = self.issue_repository.update(issue_id, issue_update)
        return IssuePublic.model_validate(updated_issue)

    def delete_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Delete issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        # Admin can delete any issue
        if current_user_role == UserRole.ADMIN:
            return self.issue_repository.delete(issue_id)
        
        # Project Manager can delete issues in their projects
        project = self.project_repository.get_by_id(issue.project_id)
        if current_user_role == UserRole.PROJECT_MANAGER and project and project.created_by == current_user_id:
            return self.issue_repository.delete(issue_id)
        
        # Contributors can delete their own issues
        if issue.author_id == current_user_id:
            return self.issue_repository.delete(issue_id)
        
        return False

    def assign_issue(self, issue_id: int, assignee_id: int | None, current_user_id: int, current_user_role: UserRole) -> IssuePublic:
        """Assign or unassign issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        if not self._can_update_issue(issue, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this issue.")
        
        if assignee_id and not self._can_assign_to_user(issue.project_id, assignee_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot assign this user.")
        
        updated_issue = self.issue_repository.assign_issue(issue_id, assignee_id)
        return IssuePublic.model_validate(updated_issue)

    def close_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> IssuePublic:
        """Close issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        if not self._can_update_issue(issue, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot close this issue.")
        
        updated_issue = self.issue_repository.close_issue(issue_id, current_user_id)
        return IssuePublic.model_validate(updated_issue)

    def reopen_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> IssuePublic:
        """Reopen issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        if not self._can_update_issue(issue, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot reopen this issue.")
        
        updated_issue = self.issue_repository.reopen_issue(issue_id)
        return IssuePublic.model_validate(updated_issue)

    def get_issues_by_assignee(self, assignee_id: int, current_user_id: int, current_user_role: UserRole) -> list[IssuePublic]:
        """Get issues assigned to user"""
        # Admin can see any user's assigned issues
        if current_user_role == UserRole.ADMIN:
            issues = self.issue_repository.get_issues_by_assignee(assignee_id)
            return [IssuePublic.model_validate(issue) for issue in issues]
        
        # Users can only see their own assigned issues
        if assignee_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can only view assigned issues.")
        
        issues = self.issue_repository.get_issues_by_assignee(assignee_id)
        # Filter issues from projects user has access to
        accessible_issues = []
        for issue in issues:
            if self._can_view_issue(issue.project_id, current_user_id, current_user_role):
                accessible_issues.append(issue)
        
        return [IssuePublic.model_validate(issue) for issue in accessible_issues]

    def get_issues_by_author(self, author_id: int, current_user_id: int, current_user_role: UserRole) -> list[IssuePublic]:
        """Get issues created by user"""
        # Admin can see any user's authored issues
        if current_user_role == UserRole.ADMIN:
            issues = self.issue_repository.get_issues_by_author(author_id)
            return [IssuePublic.model_validate(issue) for issue in issues]
        
        # Users can only see their own authored issues
        if author_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can only view issues authored by yourself.")
        
        issues = self.issue_repository.get_issues_by_author(author_id)
        # Filter issues from projects user has access to
        accessible_issues = []
        for issue in issues:
            if self._can_view_issue(issue.project_id, current_user_id, current_user_role):
                accessible_issues.append(issue)
        
        return [IssuePublic.model_validate(issue) for issue in accessible_issues]

    def add_label_to_issue(self, issue_id: int, label_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Add label to issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            return False
        
        if not self._can_view_issue(issue.project_id, current_user_id, current_user_role):
            return False
        
        result = self.issue_repository.add_label_to_issue(issue_id, label_id)
        return result is not None

    def remove_label_from_issue(self, issue_id: int, label_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Remove label from issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            return False
        
        if not self._can_view_issue(issue.project_id, current_user_id, current_user_role):
            return False
        
        return self.issue_repository.remove_label_from_issue(issue_id, label_id)

    def _can_create_issue_in_project(self, project_id: int, user_id: int, user_role: str) -> bool:
        """Check if user can create issues in project"""
        if user_role == UserRole.ADMIN:
            return True
        
        project = self.project_repository.get_by_id(project_id)
        if not project:
            return False
        
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Contributors can create issues in projects they are members of
        return self.project_repository.is_member(project_id, user_id)

    def _can_view_issue(self, project_id: int, user_id: int, user_role: str) -> bool:
        """Check if user can view issues in project"""
        if user_role == UserRole.ADMIN:
            return True
        
        project = self.project_repository.get_by_id(project_id)
        if not project:
            return False
        
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        return self.project_repository.is_member(project_id, user_id)

    def _can_update_issue(self, issue, user_id: int, user_role: str) -> bool:
        """Check if user can update issue"""
        if user_role == UserRole.ADMIN:
            return True
        
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            return False
        
        # Project Manager can update issues in their projects
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Contributors can update issues assigned to them or issues they created
        return issue.assignee_id == user_id or issue.author_id == user_id

    def _can_assign_to_user(self, project_id: int, assignee_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Check if user can be assigned to project issues"""
        # Check if assignee exists and is active
        assignee = self.user_repository.get_by_id(assignee_id)
        if not assignee or not assignee.is_active:
            return False
        
        if current_user_role == UserRole.ADMIN:
            return True
        
        project = self.project_repository.get_by_id(project_id)
        if not project:
            return False
        
        # Project Manager can assign to any project member
        if current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id:
            return self.project_repository.is_member(project_id, assignee_id)
        
        # Contributors can only assign issues to themselves
        if current_user_role == UserRole.CONTRIBUTOR:
            return assignee_id == current_user_id and self.project_repository.is_member(project_id, assignee_id)
        
        return False
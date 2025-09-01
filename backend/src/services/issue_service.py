from src.dto.issue import IssueCreate, IssueUpdate
from src.repositories import IssueRepository, ProjectRepository, UserRepository, LabelRepository
from src.exceptions.project_exceptions import ProjectNotFoundError
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.user_exceptions import UserNotFoundError, InactiveUserAccountError
from src.exceptions.issue_exceptions import IssueAssigneeError, IssueNotFoundError
from src.exceptions.label_exceptions import LabelNotFoundError, LabelAlreadyAddedError
from src.models import Issue, Project
from src.models.enums import UserRole

class IssueService:
    """Service for issue operations"""
    
    def __init__(self, issue_repository: IssueRepository, project_repository: ProjectRepository, user_repository: UserRepository, label_repository: LabelRepository):
        self.issue_repository = issue_repository
        self.project_repository = project_repository
        self.user_repository = user_repository
        self.label_repository = label_repository

    def create_issue(self, issue_create: IssueCreate, current_user_id: int, current_user_role: UserRole) -> Issue:
        """Create a new issue"""
        # Check if project exists
        project = self.project_repository.get_by_id(issue_create.project_id)
        if not project:
            raise ProjectNotFoundError()
        
        # Check if user can create issues in this project
        if not self._can_create_issue_in_project(project, current_user_id, current_user_role):
            raise NotAuthorizedError("Cannot create issue in this project.")
        
        # Validate assignee if provided
        if issue_create.assignee_id:
            self._validate_assignee(project, issue_create.assignee_id, current_user_id, current_user_role)
            
        db_issue = issue_create.model_dump()
        db_issue["author_id"] = current_user_id
        db_issue = Issue.model_validate(db_issue)

        return self.issue_repository.create(db_issue)

    def get_issue_by_id(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> Issue:
        """Get issue by ID"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        # Check if user can view this issue
        if not self._can_view_issue(issue.project_id, current_user_id, current_user_role):
            raise NotAuthorizedError("Not authorized to view this issue.")
        
        return issue

    def get_all_issues(self, current_user_id: int, current_user_role: UserRole) -> list[Issue]:
        """Get all issues based on user role and permissions"""
        # Admin can see all issues
        if current_user_role == UserRole.ADMIN:
            return self.issue_repository.get_all()
        
        # Project Manager sees issues from projects they created
        if current_user_role == UserRole.PROJECT_MANAGER:
            projects = self.project_repository.get_projects_by_creator(current_user_id)
            project_ids = [project.id for project in projects if project.id is not None]

        else:
            # Contributors see issues from projects they are members of
            projects = self.project_repository.get_user_projects(current_user_id)
            project_ids = [project.id for project in projects if project.id is not None]

        if not project_ids:
            return []
        
        return self.issue_repository.get_issues_by_project_ids(project_ids)


    def get_issues_by_project(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> list[Issue]:
        """Get issues by project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        if not self._can_view_issue(project_id, current_user_id, current_user_role):
            raise NotAuthorizedError("You are not authorized to view the issues of this project.")
        
        issues = self.issue_repository.get_issues_by_project(project_id)

        return issues

    def update_issue(self, issue_id: int, issue_update: IssueUpdate, current_user_id: int, current_user_role: UserRole) -> Issue:
        """Update issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError("No issue was found to update.")

        can_update, project = self._can_update_issue(issue, current_user_id, current_user_role)

        if not can_update:
            raise NotAuthorizedError("Not authorized to update this issue.")
        
        if not project:
            raise ProjectNotFoundError("Project no longer exists.")
        
        # Validate assignee if being updated
        if issue_update.assignee_id:
            self._validate_assignee(project, issue_update.assignee_id, current_user_id, current_user_role)
        
        updated_issue = self.issue_repository.update(issue_id, issue_update)

        if not updated_issue:
            raise IssueNotFoundError("Issue no longer exists.")
        
        return updated_issue

    def delete_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Delete issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        # Admin can delete any issue
        if current_user_role == UserRole.ADMIN:
            self.issue_repository.delete(issue_id)
            return
        
        # Project Manager can delete issues in their projects
        project = self.project_repository.get_by_id(issue.project_id)
        if current_user_role == UserRole.PROJECT_MANAGER and project and project.created_by == current_user_id:
            self.issue_repository.delete(issue_id)
            return
        
        # Contributors can delete their own issues only
        if issue.author_id == current_user_id:
            self.issue_repository.delete(issue_id)
            return        
        
        raise NotAuthorizedError("Not authorized to delete this issue.")

    def assign_issue(self, issue_id: int, assignee_id: int | None, current_user_id: int, current_user_role: UserRole) -> Issue:
        """Assign or unassign issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError()

        # For unassignment (assignee_id is None)
        if assignee_id is None:
            # Only validate that user can update the issue
            can_update, project = self._can_update_issue(issue, current_user_id, current_user_role)
            if not can_update:
                raise NotAuthorizedError("Not authorized to unassign this issue.")
            
            if not project:
                raise ProjectNotFoundError("Project no longer exists.")

            updated_issue = self.issue_repository.assign_issue(issue_id, None)
            if not updated_issue:
                raise IssueNotFoundError("Issue no longer exists.")
        
            return updated_issue
        
        # For assignment -> (assignee_id is not None) Validate if user has permission to assign the issue    
        can_update, project = self._can_update_issue(issue, current_user_id, current_user_role)

        if not can_update:
            raise NotAuthorizedError("Not authorized to assign this issue.")
        
        if not project:
            raise ProjectNotFoundError("Project no longer exists.")
        
        # Validate if assignee is valid to be assigned the issue
        self._validate_assignee(project, assignee_id, current_user_id, current_user_role)
        
        updated_issue = self.issue_repository.assign_issue(issue_id, assignee_id)

        if not updated_issue:
            raise IssueNotFoundError("Issue no longer exists.")
        
        return updated_issue

    def close_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> Issue:
        """Close issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        if not self._can_update_issue(issue, current_user_id, current_user_role):
            raise NotAuthorizedError("You are not authorized to close this issue.")
        
        updated_issue = self.issue_repository.close_issue(issue_id, current_user_id)

        if not updated_issue:
            raise IssueNotFoundError("Issue no longer exists.")

        return updated_issue

    def reopen_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> Issue:
        """Reopen issue"""
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        if not self._can_update_issue(issue, current_user_id, current_user_role):
            raise NotAuthorizedError("You are not authorized to reopen this issue.")
        
        updated_issue = self.issue_repository.reopen_issue(issue_id)

        if not updated_issue:
            raise IssueNotFoundError("Issue no longer exists.")

        return updated_issue

    def get_issues_by_assignee(self, assignee_id: int, current_user_id: int, current_user_role: UserRole) -> list[Issue]:
        """Get issues assigned to user"""
        # Validate assigne exists
        assignee = self.user_repository.get_by_id(assignee_id)
        if not assignee:
            raise UserNotFoundError("Assignee not found.")
        # Admin can see any user's assigned issues
        if current_user_role == UserRole.ADMIN:
            return self.issue_repository.get_issues_by_assignee(assignee_id)
        
        # Project Manager can see assigned issues for users in their projects
        if current_user_role == UserRole.PROJECT_MANAGER:
            issues = self.issue_repository.get_issues_by_assignee(assignee_id)
            accessible_issues = []
            for issue in issues:
                if self._can_view_issue(issue.project_id, current_user_id, current_user_role):
                    accessible_issues.append(issue)
                    return accessible_issues

        # Contributors can only see their own assigned issues
        if assignee_id != current_user_id:
            raise NotAuthorizedError("You can only view your assigned issues.")
        
        issues = self.issue_repository.get_issues_by_assignee(assignee_id)
        # Filter issues from projects user has access to
        accessible_issues = []
        for issue in issues:
            if self._can_view_issue(issue.project_id, current_user_id, current_user_role):
                accessible_issues.append(issue)
        
        return accessible_issues

    def get_issues_by_author(self, author_id: int, current_user_id: int, current_user_role: UserRole) -> list[Issue]:
        """Get issues created by user"""
        # Check that author exists
        author = self.user_repository.get_by_id(author_id)
        if not author:
            raise UserNotFoundError(f"User with id:{author_id} was not found.")
        
        # Admin can view any user's authored issues
        if current_user_role == UserRole.ADMIN:
            return self.issue_repository.get_issues_by_author(author_id)
        
        # Contributors can only view their own authored issues
        if current_user_role == UserRole.CONTRIBUTOR:
            if author_id != current_user_id:
                raise NotAuthorizedError("You can only view issues created by yourself.")
            return self.issue_repository.get_issues_by_author(author_id)
        
        # Project Managers can view issues authored by anyone in projects they own 
        issues = self.issue_repository.get_issues_by_author(author_id)
        accessible_issues = []
        for issue in issues:
            if self._can_view_issue(issue.project_id, current_user_id, current_user_role):
                accessible_issues.append(issue)
        
        return accessible_issues

    def add_label_to_issue(self, issue_id: int, label_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Add label to issue"""
        # Check issue exists
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError("Couldn't add label to issue: Issue does not exist.")
        
        # Check label exists
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise LabelNotFoundError()
        
        # Check if user is authorized to modify this issue
        can_update, _ = self._can_update_issue(issue,current_user_id,current_user_role)
        if not can_update:
            raise NotAuthorizedError("You cannot add labels to this issue.")
        
        # Check if issue already has this label
        current_labels = self.label_repository.get_labels_by_issue(issue_id)
        current_label_ids = [label.id for label in current_labels]
        if label_id in current_label_ids:
            raise LabelAlreadyAddedError()
        
        self.issue_repository.add_label_to_issue(issue_id, label_id)

    def remove_label_from_issue(self, issue_id: int, label_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Remove label from issue"""
        # Check issue exists
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError("Couldn't remove label from issue: Issue does not exist.")
        
        # Check label exists
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise LabelNotFoundError()
        
        # Check if user is authorized to modify this issue
        can_update, _ = self._can_update_issue(issue,current_user_id,current_user_role)
        if not can_update:
            raise NotAuthorizedError("You cannot remove labels from this issue.")
        
        self.issue_repository.remove_label_from_issue(issue_id, label_id)

    def _can_create_issue_in_project(self, project: Project, user_id: int, user_role: UserRole) -> bool:
        """Check if user can create issues in project"""
        if user_role == UserRole.ADMIN:
            return True
        
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Contributors can create issues in projects they are members of
        return self.project_repository.is_member(project.id, user_id)

    def _can_view_issue(self, project_id: int, user_id: int, user_role: UserRole) -> bool:
        """Check if user can view issues in project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            return False
        
        if user_role == UserRole.ADMIN:
            return True
        
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        return self.project_repository.is_member(project_id, user_id)

    def _can_update_issue(self, issue: Issue, user_id: int, user_role: UserRole) -> tuple[bool, Project | None]:
        """Check if user can update issue"""
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            return False, None

        if user_role == UserRole.ADMIN:
            return True, project
        
        # Project Manager can update issues in their projects
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True, project
        
        # Contributors can update issues assigned to them or issues they created
        return issue.assignee_id == user_id or issue.author_id == user_id, project

    def _validate_assignee(self, project: Project, assignee_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Validate if user can be assigned to project issues"""
        # Check if assignee exists and is active
        assignee = self.user_repository.get_by_id(assignee_id)
        if not assignee:
            raise UserNotFoundError()
        
        if not assignee.is_active:
            raise InactiveUserAccountError("Cannot assign issues to inactive users.")
        
        if not self.project_repository.is_member(project.id, assignee_id):
            raise IssueAssigneeError()
        
        if current_user_role == UserRole.ADMIN:
            return
        
        if current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id:
            return
        
        if current_user_role == UserRole.CONTRIBUTOR and assignee_id == current_user_id:
            return

        raise NotAuthorizedError("You are not authorized to assign this user to the issue.")
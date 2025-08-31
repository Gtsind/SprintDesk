from typing import cast
from src.dto.comment import CommentCreate, CommentUpdate
from src.models import Comment, Issue, Project
from src.exceptions.issue_exceptions import IssueNotFoundError
from src.exceptions.project_exceptions import ProjectNotFoundError
from src.exceptions.comment_exceptions import CommentNotFoundError
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.repositories import CommentRepository, IssueRepository, ProjectRepository
from src.models.enums import UserRole

class CommentService:
    """Service for comment operations"""
    
    def __init__(self, comment_repository: CommentRepository, issue_repository: IssueRepository, project_repository: ProjectRepository):
        self.comment_repository = comment_repository
        self.issue_repository = issue_repository
        self.project_repository = project_repository

    def create_comment(self, comment_create: CommentCreate, current_user_id: int, current_user_role: UserRole) -> Comment:
        """Create a new comment"""
        # Check if issue exists
        issue = self.issue_repository.get_by_id(comment_create.issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        # Check if project exists
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            raise ProjectNotFoundError()
        
        # Check if user can comment on this issue
        if not self._can_access_project(issue.project_id, project.created_by, current_user_id,current_user_role):
            raise NotAuthorizedError("Not allowed to comment on this issue.")
        
        db_comment = Comment.model_validate(comment_create, update={"author_id": current_user_id})
        
        return self.comment_repository.create(db_comment)

    def get_comment_by_id(self, comment_id: int, current_user_id: int, current_user_role: UserRole) -> Comment:
        """Get comment by ID"""
        comment, issue, project = self._validate_comment_and_get_context(comment_id)
        
        if not self._can_access_project(issue.project_id, project.created_by, current_user_id, current_user_role):
            raise NotAuthorizedError("Not allowed to view this comment.")
        
        return comment

    def get_comments_by_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> list[Comment]:
        """Get all comments for an issue"""
        # Check if issue exists
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            raise ProjectNotFoundError()
        
        # Check if user can accesss this project's issues
        if not self._can_access_project(issue.project_id, project.created_by, current_user_id, current_user_role):
            raise NotAuthorizedError("Not allowed to view comments for this issue.")
        
        return self.comment_repository.get_comments_by_issue(issue_id)

    def get_comments_by_author(self, author_id: int, current_user_id: int, current_user_role: UserRole) -> list[Comment]:
        """Get all comments by a specific author"""
        # Admin can see any user's comments
        if current_user_role == UserRole.ADMIN:
            return self.comment_repository.get_comments_by_author(author_id)
        
        # Contributors can only see their own comments
        if current_user_role == UserRole.CONTRIBUTOR and author_id != current_user_id:
            raise NotAuthorizedError("Not allowed to view these comments.")
        
        # Get all comments by author
        comments: list[Comment] = self.comment_repository.get_comments_by_author(author_id)

        # Filter by projects the user can access
        accessible_comments = []
        for comment in comments:
            try:
                comment_id = cast(int, comment.id)
                _, issue, project = self._validate_comment_and_get_context(comment_id)
                if self._can_access_project(issue.project_id, project.created_by, current_user_id, current_user_role):
                    accessible_comments.append(comment)
            except (CommentNotFoundError, IssueNotFoundError, ProjectNotFoundError):
                # Skip comments with broken references (e.g., a deleted issue)
                continue
        
        return accessible_comments

    def update_comment(self, comment_id: int, comment_update: CommentUpdate, current_user_id: int, current_user_role: UserRole) -> Comment:
        """Update comment"""
        comment, _, project = self._validate_comment_and_get_context(comment_id)
        
        # Check if user can update this comment
        if not self._can_modify_comment(comment, project.created_by, current_user_id, current_user_role):
            raise NotAuthorizedError("Not allowed to update this comment.")
        
        updated_comment = self.comment_repository.update(comment_id, comment_update)
        if not updated_comment:
            raise CommentNotFoundError("Comment no longer exists.")
        
        return updated_comment

    def delete_comment(self, comment_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Delete comment"""
        comment, _, project = self._validate_comment_and_get_context(comment_id)
        
        # Check if user can delete this comment
        if not self._can_modify_comment(comment, project.created_by, current_user_id, current_user_role):
            raise NotAuthorizedError("Not allowed to delete this comment.")
        
        self.comment_repository.delete(comment_id)

    def _can_access_project(self, project_id: int, project_creator: int, user_id: int, user_role: UserRole) -> bool:
        """Check if user can access project (view/comment on issues)"""
        # Admin -> can access everything
        if user_role == UserRole.ADMIN:
            return True
        
        # Project Manager -> Only projects they created
        if user_role == UserRole.PROJECT_MANAGER and project_creator == user_id:
            return True
        
        # Contributors -> Only projects they are members of
        return self.project_repository.is_member(project_id, user_id)
    
    def _can_modify_comment(self, comment: Comment, project_creator: int, user_id: int, user_role: UserRole) -> bool:
        """Check if user can update/delete comment"""
        if user_role == UserRole.ADMIN:
            return True
        
        # Project Manager can modify comments in their projects
        if user_role == UserRole.PROJECT_MANAGER and project_creator == user_id:
            return True
        
        # Contributors can only modify their own comments
        return comment.author_id == user_id
    
    def _validate_comment_and_get_context(self, comment_id: int) -> tuple[Comment, Issue, Project]:
        """Validate comment exists and get related context (issue, project)"""
        comment = self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise CommentNotFoundError()
        
        issue = self.issue_repository.get_by_id(comment.issue_id)
        if not issue:
            raise IssueNotFoundError()
        
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            raise ProjectNotFoundError()
        
        return comment, issue, project
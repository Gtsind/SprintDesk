from fastapi import HTTPException, status
from src.dto.comment import CommentCreate, CommentUpdate, CommentPublic
from src.repositories.comment_repository import CommentRepository
from src.repositories.issue_repository import IssueRepository
from src.repositories.project_repository import ProjectRepository
from src.utils.enums import UserRole

class CommentService:
    """Service for comment operations"""
    
    def __init__(self, comment_repository: CommentRepository, issue_repository: IssueRepository, project_repository: ProjectRepository):
        self.comment_repository = comment_repository
        self.issue_repository = issue_repository
        self.project_repository = project_repository

    def create_comment(self, comment_create: CommentCreate, current_user_id: int, current_user_role: UserRole) -> CommentPublic:
        """Create a new comment"""
        # Check if issue exists
        issue = self.issue_repository.get_by_id(comment_create.issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        # Check if user can comment on this issue
        if not self._can_comment_on_issue(issue.project_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to comment on this issue.")
        
        db_comment = self.comment_repository.create(comment_create, current_user_id)
        
        return CommentPublic.model_validate(db_comment)

    def get_comment_by_id(self, comment_id: int, current_user_id: int, current_user_role: UserRole) -> CommentPublic:
        """Get comment by ID"""
        comment = self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
        
        # Check if user can view this comment
        issue = self.issue_repository.get_by_id(comment.issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        if not self._can_view_comment(issue.project_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this comment.")
        
        return CommentPublic.model_validate(comment)

    def get_comments_by_issue(self, issue_id: int, current_user_id: int, current_user_role: UserRole) -> list[CommentPublic]:
        """Get all comments for an issue"""
        # Check if issue exists
        issue = self.issue_repository.get_by_id(issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
        
        # Check if user can view comments on this issue
        if not self._can_view_comment(issue.project_id, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view comments.")
        
        comments = self.comment_repository.get_comments_by_issue(issue_id)
        return [CommentPublic.model_validate(comment) for comment in comments]

    def get_comments_by_author(self, author_id: int, current_user_id: int, current_user_role: UserRole) -> list[CommentPublic]:
        """Get all comments by a specific author"""
        # Admin can see any user's comments
        if current_user_role == UserRole.ADMIN:
            comments = self.comment_repository.get_comments_by_author(author_id)
            return [CommentPublic.model_validate(comment) for comment in comments]
        
        # Users can only see their own comments
        if author_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view these comments.")
        
        comments = self.comment_repository.get_comments_by_author(author_id)
        # Filter comments from issues in projects user has access to
        accessible_comments = []
        for comment in comments:
            issue = self.issue_repository.get_by_id(comment.issue_id)
            if issue and self._can_view_comment(issue.project_id, current_user_id, current_user_role):
                accessible_comments.append(comment)
        
        return [CommentPublic.model_validate(comment) for comment in accessible_comments]

    def update_comment(self, comment_id: int, comment_update: CommentUpdate, current_user_id: int, current_user_role: UserRole) -> CommentPublic:
        """Update comment"""
        comment = self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
        
        # Check if user can update this comment
        if not self._can_update_comment(comment, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this comment.")
        
        updated_comment = self.comment_repository.update(comment_id, comment_update)
        return CommentPublic.model_validate(updated_comment)

    def delete_comment(self, comment_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Delete comment"""
        comment = self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
        
        # Check if user can delete this comment
        if not self._can_delete_comment(comment, current_user_id, current_user_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this comment.")
        
        return self.comment_repository.delete(comment_id)

    def _can_comment_on_issue(self, project_id: int, user_id: int, user_role: str) -> bool:
        """Check if user can comment on issues in project"""
        if user_role == UserRole.ADMIN:
            return True
        
        project = self.project_repository.get_by_id(project_id)
        if not project:
            return False
        
        # Project Manager can comment on issues in their projects
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Contributors can comment on issues in projects they are members of
        return self.project_repository.is_member(project_id, user_id)

    def _can_view_comment(self, project_id: int, user_id: int, user_role: str) -> bool:
        """Check if user can view comments in project"""
        if user_role == UserRole.ADMIN:
            return True
        
        project = self.project_repository.get_by_id(project_id)
        if not project:
            return False
        
        # Project Manager can view comments in their projects
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Contributors can view comments in projects they are members of
        return self.project_repository.is_member(project_id, user_id)

    def _can_update_comment(self, comment, user_id: int, user_role: str) -> bool:
        """Check if user can update comment"""
        # Admin can update any comment
        if user_role == UserRole.ADMIN:
            return True
        
        # Get the issue to check project permissions
        issue = self.issue_repository.get_by_id(comment.issue_id)
        if not issue:
            return False
        
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            return False
        
        # Project Manager can update comments in their projects
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Users can only update their own comments
        return comment.author_id == user_id

    def _can_delete_comment(self, comment, user_id: int, user_role: str) -> bool:
        """Check if user can delete comment"""
        # Admin can delete any comment
        if user_role == UserRole.ADMIN:
            return True
        
        # Get the issue to check project permissions
        issue = self.issue_repository.get_by_id(comment.issue_id)
        if not issue:
            return False
        
        project = self.project_repository.get_by_id(issue.project_id)
        if not project:
            return False
        
        # Project Manager can delete comments in their projects
        if user_role == UserRole.PROJECT_MANAGER and project.created_by == user_id:
            return True
        
        # Users can only delete their own comments
        return comment.author_id == user_id
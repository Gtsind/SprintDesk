from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from src.models.comment import Comment
from src.dto.comment import CommentUpdate
from .base_repository import BaseRepository

class CommentRepository(BaseRepository[Comment]):
    """Repository for Comment operations"""
    
    def __init__(self, session: Session):
        super().__init__(Comment, session)

    def create(self, comment: Comment) -> Comment:
        """Create a new comment"""
        try:
            self.session.add(comment)
            self.session.commit()
            self.session.refresh(comment)
            return comment
        except IntegrityError:
            self.session.rollback()
            raise

    def update(self, comment_id: int, comment_update: CommentUpdate) -> Comment | None:
        """Update existing comment"""
        db_comment = self.get_by_id(comment_id)
        if not db_comment:
            return None
        
        update_data = comment_update.model_dump(exclude_unset=True)
        
        try:
            db_comment.sqlmodel_update(update_data)
            self.session.add(db_comment)
            self.session.commit()
            self.session.refresh(db_comment)
            return db_comment
        except (ValueError, IntegrityError):
            self.session.rollback()
            raise

    def get_comments_by_issue(self, issue_id: int) -> list[Comment]:
        """Get all comments for an issue"""
        statement = (
            select(Comment)
            .where(Comment.issue_id == issue_id)
            .order_by("created_at")
        )
        return list(self.session.exec(statement).all())

    def get_comments_by_author(self, author_id: int) -> list[Comment]:
        """Get all comments by a specific author, ordered by creation date"""
        statement = (
            select(Comment)
            .where(Comment.author_id == author_id)
            .order_by("created_at")
        )
        return list(self.session.exec(statement).all())
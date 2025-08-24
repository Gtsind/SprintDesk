from sqlmodel import Session, select
from src.models.comment import Comment
from src.dto.comment import CommentCreate, CommentUpdate
from .base_repository import BaseRepository

class CommentRepository(BaseRepository[Comment]):
    """Repository for Comment operations"""
    
    def __init__(self, session: Session):
        super().__init__(Comment, session)

    def create(self, comment_create: CommentCreate, author_id: int) -> Comment:
        """Create a new comment"""
        comment_data = comment_create.model_dump()
        comment_data["author_id"] = author_id
        db_comment = Comment(**comment_data)
        self.session.add(db_comment)
        self.session.commit()
        self.session.refresh(db_comment)
        
        return db_comment

    def update(self, comment_id: int, comment_update: CommentUpdate) -> Comment | None:
        """Update existing comment"""
        db_comment = self.get_by_id(comment_id)
        if not db_comment:
            return None
        
        update_data = comment_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_comment, field, value)
        
        self.session.add(db_comment)
        self.session.commit()
        self.session.refresh(db_comment)
        return db_comment

    def get_comments_by_issue(self, issue_id: int) -> list[Comment]:
        """Get all comments for an issue"""
        statement = (
            select(Comment)
            .where(Comment.issue_id == issue_id)
            .order_by(Comment.created_at) # type: ignore
        )
        return list(self.session.exec(statement).all())

    def get_comments_by_author(self, author_id: int) -> list[Comment]:
        """Get all comments by a specific author"""
        return self.get_all_by_field("author_id", author_id)
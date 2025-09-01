from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select, func
from src.models import Label, IssueLabel
from src.dto.label import LabelUpdate
from .base_repository import BaseRepository

class LabelRepository(BaseRepository[Label]):
    """Repository for Label operations"""
    
    def __init__(self, session: Session):
        super().__init__(Label, session)

    def create(self, label: Label) -> Label:
        """Create a new label"""
        try:
            self.session.add(label)
            self.session.commit()
            self.session.refresh(label)
            return label
        except IntegrityError:
            self.session.rollback()
            raise

    def update(self, label_id: int, label_update: LabelUpdate) -> Label | None:
        """Update existing label"""
        db_label = self.get_by_id(label_id)
        if not db_label:
            return None
        
        update_data = label_update.model_dump(exclude_unset=True)
        
        try:
            db_label.sqlmodel_update(update_data)
            self.session.add(db_label)
            self.session.commit()
            self.session.refresh(db_label)
            return db_label
        except (ValueError, IntegrityError):
            self.session.rollback()
            raise

    def get_by_name(self, name: str) -> Label | None:
        """Get label by name"""
        statement = select(Label).where(func.lower(Label.name) == name.lower())
        
        return self.session.exec(statement).first()
    
    def get_labels_filtered(self, active_filter: bool | None, name_filter: str | None) -> list[Label]:
        """Get labels with optional filtering"""
        statement = select(Label)
        
        # Apply active filter
        if active_filter is not None:
            statement = statement.where(Label.is_active == active_filter)
        
        # Apply name filter (case-insensitive partial match)
        if name_filter:
            statement = statement.where(func.lower(Label.name).contains(name_filter.lower()))
        
        # Order by name for consistent results
        statement = statement.order_by(Label.name)
        
        return list(self.session.exec(statement).all())

    def get_labels_by_issue(self, issue_id: int) -> list[Label]:
        """Get all active labels for a specific issue"""
        statement = (
            select(Label)
            .join(IssueLabel)
            .where(IssueLabel.issue_id == issue_id)
            .where(Label.is_active == True)
            .order_by(Label.name)
        )
        return list(self.session.exec(statement).all())
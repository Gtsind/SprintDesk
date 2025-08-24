from sqlmodel import Session, select
from src.models import Label, IssueLabel
from src.dto.label import LabelCreate, LabelUpdate
from .base_repository import BaseRepository

class LabelRepository(BaseRepository[Label]):
    """Repository for Label operations"""
    
    def __init__(self, session: Session):
        super().__init__(Label, session)

    def create(self, label_create: LabelCreate) -> Label:
        """Create a new label"""
        label_data = label_create.model_dump()
        db_label = Label(**label_data)
        self.session.add(db_label)
        self.session.commit()
        self.session.refresh(db_label)
        return db_label

    def update(self, label_id: int, label_update: LabelUpdate) -> Label | None:
        """Update existing label"""
        db_label = self.get_by_id(label_id)
        if not db_label:
            return None
        
        update_data = label_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_label, field, value)
        
        self.session.add(db_label)
        self.session.commit()
        self.session.refresh(db_label)
        return db_label

    def get_by_name(self, name: str) -> Label | None:
        """Get label by name"""
        return self.get_by_field("name", name)

    def get_active_labels(self) -> list[Label]:
        """Get all active labels"""
        return self.get_all_by_field("is_active", True)

    def get_inactive_labels(self) -> list[Label]:
        """Get all inactive labels"""
        return self.get_all_by_field("is_active", False)

    def get_labels_by_issue(self, issue_id: int) -> list[Label]:
        """Get all labels for a specific issue"""
        statement = (
            select(Label)
            .join(IssueLabel)
            .where(IssueLabel.issue_id == issue_id)
            .where(Label.is_active == True)
        )
        return list(self.session.exec(statement).all())
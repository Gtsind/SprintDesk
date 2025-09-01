from src.dto.label import LabelCreate, LabelUpdate
from src.repositories.label_repository import LabelRepository
from src.models.enums import UserRole
from src.models import Label
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.label_exceptions import LabelAlreadyExistsError, LabelNotFoundError

class LabelService:
    """Service for label operations"""
    
    def __init__(self, label_repository: LabelRepository):
        self.label_repository = label_repository

    def create_label(self, label_create: LabelCreate) -> Label:
        """Create a new label (all authenticated users)"""
        label_name = label_create.name.strip().lower()

        # Check for duplicate names
        if self.label_repository.get_by_name(label_name):
            raise LabelAlreadyExistsError()
        
        db_label = Label.model_validate(label_create, update={"name": label_name})
        
        return self.label_repository.create(db_label)

    def get_label_by_id(self, label_id: int) -> Label:
        """Get label by ID"""
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise LabelNotFoundError()
        return label

    def get_labels(
        self, 
        current_user_role: UserRole, 
        active_filter: bool | None = None, 
        name_filter: str | None = None
    ) -> list[Label]:
        """Get labels with optional filtering"""
        
        # Only admins and project managers can see inactive labels
        if active_filter is False:
            if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
                raise NotAuthorizedError("You are not authorized to view inactive labels.")
        
        return self.label_repository.get_labels_filtered(active_filter, name_filter)

    def update_label(self, label_id: int, label_update: LabelUpdate) -> Label:
        """Update label (all authenticated users)"""
        
        # Check if label exists
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise LabelNotFoundError()

        # Check for duplicate names when updating name
        if label_update.name and label_update.name != label.name:
            existing_label = self.label_repository.get_by_name(label_update.name)
            if existing_label:
                raise LabelAlreadyExistsError()

        updated_label = self.label_repository.update(label_id, label_update)
        if not updated_label:
            raise LabelNotFoundError(f"Failed to update label with ID {label_id}.")
        
        return updated_label

    def delete_label(self, label_id: int) -> None:
        """Delete label (all authenticated users)"""
        
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise LabelNotFoundError()

        self.label_repository.delete(label_id)

    def get_labels_by_issue(self, issue_id: int) -> list[Label]:
        """Get all labels for a specific issue"""
        return self.label_repository.get_labels_by_issue(issue_id)
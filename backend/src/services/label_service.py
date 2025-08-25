from fastapi import HTTPException, status
from src.dto.label import LabelCreate, LabelUpdate, LabelPublic
from src.repositories import LabelRepository
from src.models.enums import UserRole

class LabelService:
    """Service for label operations"""
    
    def __init__(self, label_repository: LabelRepository):
        self.label_repository = label_repository

    def create_label(self, label_create: LabelCreate, current_user_role: str) -> LabelPublic:
        """Create a new label (Admin and Project Manager only)"""
        if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to create labels."
            )
        
        # Check for dublicate names
        existing_label = self.label_repository.get_by_name(label_create.name)
        if existing_label:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A label with this name already exists."
            )
        
        db_label = self.label_repository.create(label_create)
        
        return LabelPublic.model_validate(db_label)

    def get_label_by_id(self, label_id: int) -> LabelPublic:
        """Get label by ID"""
        # All authenticated users can view labels
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Label with ID {label_id} not found."
            )
        return LabelPublic.model_validate(label)

    def get_all_labels(self) -> list[LabelPublic]:
        """Get all labels"""
        # All authenticated users can view labels
        labels = self.label_repository.get_all()
        return [LabelPublic.model_validate(label) for label in labels]

    def get_active_labels(self) -> list[LabelPublic]:
        """Get all active labels"""
        # All authenticated users can view active labels
        labels = self.label_repository.get_active_labels()
        return [LabelPublic.model_validate(label) for label in labels]

    def get_inactive_labels(self, current_user_role: UserRole) -> list[LabelPublic]:
        """Get all inactive labels (Admin and Project Manager only)"""
        if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view inactive labels."
            )
        
        labels = self.label_repository.get_inactive_labels()
        return [LabelPublic.model_validate(label) for label in labels]

    def update_label(self, label_id: int, label_update: LabelUpdate, current_user_role: UserRole) -> LabelPublic:
        """Update label (Admin and Project Manager only)"""
        if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update labels."
            )
        
        # Check if label exists
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Label with ID {label_id} not found."
            )

        # Check for duplicate names when updating
        if label_update.name:
            existing_label = self.label_repository.get_by_name(label_update.name)
            if existing_label and existing_label.id != label_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Another label with this name already exists."
                )

        updated_label = self.label_repository.update(label_id, label_update)
        return LabelPublic.model_validate(updated_label)

    def delete_label(self, label_id: int, current_user_role: UserRole) -> bool:
        """Delete label (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete labels."
            )
        
        label = self.label_repository.get_by_id(label_id)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Label with ID {label_id} not found."
            )

        self.label_repository.delete(label_id)
        return True

    def deactivate_label(self, label_id: int, current_user_role: str) -> LabelPublic | None:
        """Deactivate label (Admin and Project Manager only)"""
        if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to deactivate labels."
            )
        
        updated_label = self.label_repository.update(label_id, LabelUpdate(is_active=False))
        return LabelPublic.model_validate(updated_label)

    def activate_label(self, label_id: int, current_user_role: UserRole) -> LabelPublic:
        """Activate label (Admin and Project Manager only)"""
        if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to activate labels."
            )
        
        updated_label = self.label_repository.update(label_id, LabelUpdate(is_active=True))
        return LabelPublic.model_validate(updated_label)

    def get_by_name(self, name: str) -> LabelPublic:
        """Get label by name"""
        # All authenticated users can search for labels by name
        label = self.label_repository.get_by_name(name)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Label '{name}' not found."
            )
        return LabelPublic.model_validate(label)

    def get_labels_by_issue(self, issue_id: int) -> list[LabelPublic]:
        """Get all labels for a specific issue"""
        # All authenticated users can view issue labels
        labels = self.label_repository.get_labels_by_issue(issue_id)
        return [LabelPublic.model_validate(label) for label in labels]
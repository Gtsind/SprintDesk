from fastapi import APIRouter, Depends, HTTPException, status, Query
from src.services.label_service import LabelService
from src.dto.label import LabelCreate, LabelUpdate, LabelPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user, get_label_service
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.label_exceptions import LabelNotFoundError, LabelAlreadyExistsError

router = APIRouter(prefix="/labels", tags=["Labels"])

@router.post("/", response_model=LabelPublic, status_code=status.HTTP_201_CREATED)
def create_label(
    label_create: LabelCreate,
    current_user: User = Depends(get_current_active_user),
    label_service: LabelService = Depends(get_label_service)
):
    """Create a new label"""
    try:
        return label_service.create_label(label_create)
    except LabelAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.get("/", response_model=list[LabelPublic], status_code=status.HTTP_200_OK)
def get_labels(
    current_user: User = Depends(get_current_active_user),
    label_service: LabelService = Depends(get_label_service),
    active: bool | None = Query(None, description="Filter by active status"),
    name: str | None = Query(None, description="Search by name")
):
    """Get labels with optional filtering"""
    try:
        labels = label_service.get_labels(
            current_user.role, 
            active_filter=active, 
            name_filter=name
        )
        return labels
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/{label_id}", response_model=LabelPublic, status_code=status.HTTP_200_OK)
def get_label_by_id(
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    label_service: LabelService = Depends(get_label_service)
):
    """Get label by ID"""
    try:
        return label_service.get_label_by_id(label_id)
    except LabelNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.get("/issue/{issue_id}", response_model=list[LabelPublic], status_code=status.HTTP_200_OK)
def get_labels_by_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    label_service: LabelService = Depends(get_label_service)
):
    """Get all labels for a specific issue"""
    return label_service.get_labels_by_issue(issue_id)

@router.patch("/{label_id}", response_model=LabelPublic, status_code=status.HTTP_200_OK)
def update_label(
    label_id: int,
    label_update: LabelUpdate,
    current_user: User = Depends(get_current_active_user),
    label_service: LabelService = Depends(get_label_service)
):
    """Update label"""
    try:
        return label_service.update_label(label_id, label_update)
    except LabelNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except LabelAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    label_service: LabelService = Depends(get_label_service)
):
    """Delete label"""
    try:
        label_service.delete_label(label_id)
    except LabelNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
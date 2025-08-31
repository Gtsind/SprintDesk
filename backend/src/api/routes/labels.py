from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories.label_repository import LabelRepository
from src.services.label_service import LabelService
from src.dto.label import LabelCreate, LabelUpdate, LabelPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/labels", tags=["Labels"])

@router.post("/", response_model=LabelPublic, status_code=status.HTTP_201_CREATED)
def create_label(
    label_create: LabelCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Create a new label"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.create_label(label_create, current_user.role)

@router.get("/", response_model=list[LabelPublic])
def get_all_labels(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all labels"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.get_all_labels()

@router.get("/active", response_model=list[LabelPublic])
def get_active_labels(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all active labels"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.get_active_labels()

@router.get("/inactive", response_model=list[LabelPublic])
def get_inactive_labels(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all inactive labels"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.get_inactive_labels(current_user.role)

@router.get("/{label_id}", response_model=LabelPublic)
def get_label_by_id(
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get label by ID"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.get_label_by_id(label_id)

@router.get("/name/{name}", response_model=LabelPublic)
def get_label_by_name(
    name: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get label by name"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.get_by_name(name)

@router.get("/issue/{issue_id}", response_model=list[LabelPublic])
def get_labels_by_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all labels for a specific issue"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.get_labels_by_issue(issue_id)

@router.patch("/{label_id}", response_model=LabelPublic)
def update_label(
    label_id: int,
    label_update: LabelUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Update label"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.update_label(label_id, label_update, current_user.role)

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Delete label"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    success = label_service.delete_label(label_id, current_user.role)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Label not found")

@router.patch("/{label_id}/deactivate", response_model=LabelPublic)
def deactivate_label(
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Deactivate label"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    result = label_service.deactivate_label(label_id, current_user.role)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Label not found")
    return result

@router.patch("/{label_id}/activate", response_model=LabelPublic)
def activate_label(
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Activate label"""
    label_repository = LabelRepository(session)
    label_service = LabelService(label_repository)
    
    return label_service.activate_label(label_id, current_user.role)
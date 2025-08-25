from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import ProjectRepository
from src.services.project_service import ProjectService
from src.dto.project import ProjectCreate, ProjectUpdate, ProjectPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectPublic, status_code=status.HTTP_201_CREATED)
def create_project(
    project_create: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Create a new project"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    return project_service.create_project(project_create, current_user.id, current_user.role) # type: ignore

@router.get("/", response_model=list[ProjectPublic])
def get_all_projects(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all projects based on user role"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    return project_service.get_all_projects(current_user.id, current_user.role) # type: ignore

@router.get("/{project_id}", response_model=ProjectPublic)
def get_project_by_id(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get project by ID"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    return project_service.get_project_by_id(project_id, current_user.id, current_user.role) # type: ignore

@router.put("/{project_id}", response_model=ProjectPublic)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Update project"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    return project_service.update_project(project_id, project_update, current_user.id, current_user.role) # type: ignore

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Delete project"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    success = project_service.delete_project(project_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

@router.post("/{project_id}/members/{user_id}", status_code=status.HTTP_201_CREATED)
def add_project_member(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Add member to project"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    success = project_service.add_member(project_id, user_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not add member")
    
    return {"message": "Member added successfully"}

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Remove member from project"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    success = project_service.remove_member(project_id, user_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

@router.get("/{project_id}/members")
def get_project_members(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get project members"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    return project_service.get_project_members(project_id, current_user.id, current_user.role) # type: ignore

@router.get("/status/{status}", response_model=list[ProjectPublic])
def get_projects_by_status(
    status: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get projects by status"""
    project_repository = ProjectRepository(session)
    project_service = ProjectService(project_repository)
    
    return project_service.get_projects_by_status(status, current_user.id, current_user.role) # type: ignore
from fastapi import APIRouter, Depends, HTTPException, status
from typing import cast
from src.services.project_service import ProjectService
from src.services.user_service import UserService
from src.dto.project import ProjectCreate, ProjectUpdate, ProjectPublic
from src.dto.user import UserPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user, get_project_service, get_user_service
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.user_exceptions import UserNotFoundError
from src.exceptions.project_exceptions import ProjectNotFoundError, AlreadyProjectMemberError, ProjectCreatorRemoveError, NotProjectMemberError, InvalidProjectStatusError

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectPublic, status_code=status.HTTP_201_CREATED)
def create_project(
    project_create: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Create a new project"""
    # At runtime this is never None, but type checker complains without this line
    user_id = cast(int, current_user.id)
    
    try:
        return project_service.create_project(project_create, user_id, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/", response_model=list[ProjectPublic], status_code=status.HTTP_200_OK)
def get_all_projects(
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get all projects based on user role"""
    user_id = cast(int, current_user.id)
    
    return project_service.get_all_projects(user_id, current_user.role)

@router.get("/{project_id}", response_model=ProjectPublic, status_code=status.HTTP_200_OK)
def get_project_by_id(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get project by ID"""
    user_id = cast(int, current_user.id)
    
    try:
        return project_service.get_project_by_id(project_id, user_id, current_user.role)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.patch("/{project_id}", response_model=ProjectPublic, status_code=status.HTTP_200_OK)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Update project"""
    user_id = cast(int, current_user.id)

    try:
        return project_service.update_project(project_id, project_update, user_id, current_user.role)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Delete project"""
    user_id = cast(int, current_user.id)

    try:
        project_service.delete_project(project_id, user_id, current_user.role)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.post("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_project_member(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service),
    user_service: UserService = Depends(get_user_service)
):
    """Add member to project"""
    current_user_id = cast(int, current_user.id)

    try:
        user_service.get_user_by_id(user_id, current_user.role, current_user_id)
        project_service.add_member(project_id, user_id, current_user_id, current_user.role)
    except (ProjectNotFoundError, UserNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except AlreadyProjectMemberError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Remove member from project"""
    current_user_id = cast(int, current_user.id)
    
    try:
        project_service.remove_member(project_id, user_id, current_user_id, current_user.role)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except (ProjectCreatorRemoveError, NotProjectMemberError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.get("/{project_id}/members", response_model=list[UserPublic], status_code=status.HTTP_200_OK)
def get_project_members(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get project members"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return project_service.get_project_members(project_id, current_user_id, current_user.role)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/status/{status_name}", response_model=list[ProjectPublic], status_code=status.HTTP_200_OK)
def get_projects_by_status(
    status_name: str,
    current_user: User = Depends(get_current_active_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get projects by status"""
    current_user_id = cast(int, current_user.id)

    try:
        return project_service.get_projects_by_status(status_name, current_user_id, current_user.role)
    except InvalidProjectStatusError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
from fastapi import HTTPException, status
from src.dto.project import ProjectCreate, ProjectUpdate, ProjectPublic
from src.repositories import ProjectRepository
from src.models.enums import UserRole

class ProjectService:
    """Service for project operations"""
    
    def __init__(self, project_repository: ProjectRepository):
        self.project_repository = project_repository

    def create_project(self, project_create: ProjectCreate, current_user_id: int, current_user_role: UserRole) -> ProjectPublic:
        """Create a new project (Admin and Project Manager only)"""
        if current_user_role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create projects.")
        
        db_project = self.project_repository.create(project_create, current_user_id)
        self.project_repository.add_member(db_project.id, current_user_id) # type: ignore

        return ProjectPublic.model_validate(db_project)

    def get_project_by_id(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> ProjectPublic:
        """Get project by ID"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
        
        # Admin can see any project
        if current_user_role == UserRole.ADMIN:
            return ProjectPublic.model_validate(project)
        
        # Project Manager can see projects they created
        if current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id:
            return ProjectPublic.model_validate(project)
        
        # Contributors can only see projects they are members of
        if self.project_repository.is_member(project_id, current_user_id):
            return ProjectPublic.model_validate(project)
        
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this project")

    def get_all_projects(self, current_user_id: int, current_user_role: UserRole) -> list[ProjectPublic]:
        """Get all projects based on user role"""
        if current_user_role == UserRole.ADMIN:
            # Admin can see all projects
            projects = self.project_repository.get_all()
        elif current_user_role == UserRole.PROJECT_MANAGER:
            # Project Manager can see projects they created
            projects = self.project_repository.get_projects_by_creator(current_user_id)
        else:
            # Contributors can only see projects they are members of
            projects = self.project_repository.get_user_projects(current_user_id)
        
        return [ProjectPublic.model_validate(project) for project in projects]

    def update_project(self, project_id: int, project_update: ProjectUpdate, current_user_id: int, current_user_role: UserRole) -> ProjectPublic:
        """Update project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        if not (
            # Admin can update any project
            current_user_role == UserRole.ADMIN
            # Project Manager can update projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this project")

        updated_project = self.project_repository.update(project_id, project_update)
        return ProjectPublic.model_validate(updated_project)

    def delete_project(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Delete project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        if not (
            # Admin can delete any project
            current_user_role == UserRole.ADMIN
            # Project Manager can delete projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this project")

        return self.project_repository.delete(project_id)

    def add_member(self, project_id: int, user_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Add member to project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        if not (
            # Admin can add members to any project
            current_user_role == UserRole.ADMIN
            # Project Manager can add members to projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add members")

        if self.project_repository.is_member(project_id, user_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member")

        return self.project_repository.add_member(project_id, user_id) is not None

    def remove_member(self, project_id: int, user_id: int, current_user_id: int, current_user_role: UserRole) -> bool:
        """Remove member from project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        if not (
            # Admin can remove members from any project
            current_user_role == UserRole.ADMIN
            # Project Manager can remove members from projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to remove members")

        if user_id == project.created_by:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the project creator")

        return self.project_repository.remove_member(project_id, user_id)

    def get_project_members(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> list:
        """Get project members"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        # Admin can see members of any project
        if current_user_role == UserRole.ADMIN:
            return self.project_repository.get_project_members(project_id)
        # Project Manager can see members of projects they created
        if current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id:
            return self.project_repository.get_project_members(project_id)
        # Contributors can see members of projects they are part of
        if self.project_repository.is_member(project_id, current_user_id):
            return self.project_repository.get_project_members(project_id)
        
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view members")

    def is_member(self, project_id: int, user_id: int) -> bool:
        """Check if user is member of project"""
        return self.project_repository.is_member(project_id, user_id)

    def get_projects_by_status(self, status: str, current_user_id: int, current_user_role: UserRole) -> list[ProjectPublic]:
        """Get projects by status based on user role"""
        if current_user_role == UserRole.ADMIN:
            # Admin can see all projects with this status
            projects = self.project_repository.get_projects_by_status(status)
        elif current_user_role == UserRole.PROJECT_MANAGER:
            # Project Manager can see their projects with this status
            all_projects = self.project_repository.get_projects_by_creator(current_user_id)
            projects = [project for project in all_projects if project.status == status]
        else:
            # Contributors can see their member projects with this status
            all_projects = self.project_repository.get_user_projects(current_user_id)
            projects = [project for project in all_projects if project.status == status]
        
        return [ProjectPublic.model_validate(project) for project in projects]
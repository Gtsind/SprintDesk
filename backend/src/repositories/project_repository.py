from sqlmodel import Session, select
from models.project import Project
from models.intermediate_tables import ProjectMembership
from dto.project import ProjectCreate, ProjectUpdate
from .base_repository import BaseRepository

class ProjectRepository(BaseRepository[Project]):
    """Repository for Project operations"""
    
    def __init__(self, session: Session):
        super().__init__(Project, session)

    def create(self, project_create: ProjectCreate, created_by: int) -> Project:
        """Create a new project"""
        project_data = project_create.model_dump()
        project_data["created_by"] = created_by
        db_project = Project(**project_data)
        self.session.add(db_project)
        self.session.commit()
        self.session.refresh(db_project)
        return db_project

    def update(self, project_id: int, project_update: ProjectUpdate) -> Project | None:
        """Update existing project"""
        db_project = self.get_by_id(project_id)
        if not db_project:
            return None
        
        update_data = project_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_project, field, value)
        
        self.session.add(db_project)
        self.session.commit()
        self.session.refresh(db_project)
        return db_project

    def get_projects_by_creator(self, creator_id: int) -> list[Project]:
        """Get projects created by a specific user"""
        return self.get_all_by_field("created_by", creator_id)

    def get_projects_by_status(self, status: str) -> list[Project]:
        """Get projects by status"""
        return self.get_all_by_field("status", status)

    def get_user_projects(self, user_id: int) -> list[Project]:
        """Get projects where user is a member"""
        statement = (
            select(Project)
            .join(ProjectMembership)
            .where(ProjectMembership.user_id == user_id)
        )
        return list(self.session.exec(statement).all())

    def add_member(self, project_id: int, user_id: int) -> ProjectMembership:
        """Add a member to a project"""
        membership = ProjectMembership(project_id=project_id, user_id=user_id)
        self.session.add(membership)
        self.session.commit()
        self.session.refresh(membership)
        return membership

    def remove_member(self, project_id: int, user_id: int) -> bool:
        """Remove a member from a project"""
        statement = select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user_id
        )
        membership = self.session.exec(statement).first()
        if membership:
            self.session.delete(membership)
            self.session.commit()
            return True
        return False

    def is_member(self, project_id: int, user_id: int) -> bool:
        """Check if user is a member of the project"""
        statement = select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user_id
        )
        return self.session.exec(statement).first() is not None

    def get_project_members(self, project_id: int) -> list[ProjectMembership]:
        """Get all members of a project"""
        statement = select(ProjectMembership).where(
            ProjectMembership.project_id == project_id
        )
        return list(self.session.exec(statement).all())
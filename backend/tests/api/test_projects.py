import pytest
from fastapi.testclient import TestClient
from src.models import User, Project
from src.models.enums import ProjectStatus
from tests.conftest import get_auth_token, get_auth_headers

class TestProjectEndpoints:
    """Test project management endpoints"""

    def test_create_project_as_admin(self, client: TestClient, admin_user: User):
        """Test creating project as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        project_data = {
            "name": "New Project",
            "description": "A new test project",
            "status": "Active"
        }
        
        response = client.post("/api/v1/projects/", json=project_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["description"] == "A new test project"
        assert data["status"] == "Active"
        assert data["created_by"] == admin_user.id
        assert "id" in data
        assert "created_at" in data

    def test_create_project_as_project_manager(self, client: TestClient, project_manager_user: User):
        """Test creating project as project manager"""
        token = get_auth_token(client, "pm", "pmpass123")
        headers = get_auth_headers(token)
        
        project_data = {
            "name": "PM Project",
            "description": "Project created by PM"
        }
        
        response = client.post("/api/v1/projects/", json=project_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "PM Project"

    def test_create_project_as_contributor(self, client: TestClient, regular_user: User):
        """Test creating project as contributor (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        project_data = {
            "name": "Should Fail",
            "description": "This should fail"
        }
        
        response = client.post("/api/v1/projects/", json=project_data, headers=headers)
        
        assert response.status_code == 403

    def test_get_all_projects_as_admin(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test getting all projects as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/projects/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        project_names = [project["name"] for project in data]
        assert "Test Project" in project_names

    def test_get_all_projects_as_member(self, client: TestClient, regular_user: User, sample_project: Project, test_session):
        """Test getting projects as member (should only see projects they're part of)"""
        # Add regular_user as member to sample_project
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_project.id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/projects/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should see projects they're a member of
        project_ids = [project["id"] for project in data]
        assert sample_project.id in project_ids

    def test_get_project_by_id_as_admin(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test getting project by ID as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/projects/{sample_project.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_project.id
        assert data["name"] == "Test Project"

    def test_get_project_by_id_as_creator(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test getting project by ID as creator"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/projects/{sample_project.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["created_by"] == admin_user.id

    def test_get_project_by_id_unauthorized(self, client: TestClient, regular_user: User, sample_project: Project):
        """Test getting project by ID as non-member"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/projects/{sample_project.id}", headers=headers)
        
        assert response.status_code == 403

    def test_update_project_as_admin(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test updating project as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "name": "Updated Project",
            "description": "Updated description",
            "status": "Completed"
        }
        
        response = client.patch(f"/api/v1/projects/{sample_project.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project"
        assert data["description"] == "Updated description"
        assert data["status"] == "Completed"

    def test_update_project_as_creator(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test updating project as creator"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "description": "Creator updated description"
        }
        
        response = client.patch(f"/api/v1/projects/{sample_project.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Creator updated description"

    def test_update_project_unauthorized(self, client: TestClient, regular_user: User, sample_project: Project):
        """Test updating project as non-authorized user"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "name": "Should Not Update"
        }
        
        response = client.patch(f"/api/v1/projects/{sample_project.id}", json=update_data, headers=headers)
        
        assert response.status_code == 403

    def test_delete_project_as_admin(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test deleting project as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/projects/{sample_project.id}", headers=headers)
        
        assert response.status_code == 204

    def test_delete_project_unauthorized(self, client: TestClient, regular_user: User, sample_project: Project):
        """Test deleting project as unauthorized user"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/projects/{sample_project.id}", headers=headers)
        
        assert response.status_code == 403

    def test_add_project_member_as_admin(self, client: TestClient, admin_user: User, regular_user: User, sample_project: Project):
        """Test adding member to project as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/projects/{sample_project.id}/members/{regular_user.id}", headers=headers)
        
        assert response.status_code == 204

    def test_add_project_member_as_creator(self, client: TestClient, admin_user: User, regular_user: User, sample_project: Project):
        """Test adding member to project as creator"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/projects/{sample_project.id}/members/{regular_user.id}", headers=headers)
        
        assert response.status_code == 204

    def test_add_project_member_unauthorized(self, client: TestClient, regular_user: User, sample_project: Project):
        """Test adding member to project as unauthorized user"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/projects/{sample_project.id}/members/{regular_user.id}", headers=headers)
        
        assert response.status_code == 403

    def test_add_duplicate_project_member(self, client: TestClient, admin_user: User, regular_user: User, sample_project: Project, test_session):
        """Test adding already existing member"""
        # First add the member
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_project.id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/projects/{sample_project.id}/members/{regular_user.id}", headers=headers)
        
        assert response.status_code == 400

    def test_add_nonexistent_user_as_member(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test adding non-existent user as member"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/projects/{sample_project.id}/members/99999", headers=headers)
        
        assert response.status_code == 404

    def test_remove_project_member_as_admin(self, client: TestClient, admin_user: User, regular_user: User, sample_project: Project, test_session):
        """Test removing member from project as admin"""
        # First add the member
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_project.id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/projects/{sample_project.id}/members/{regular_user.id}", headers=headers)
        
        assert response.status_code == 204

    def test_remove_project_creator_should_fail(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test removing project creator (should fail)"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/projects/{sample_project.id}/members/{admin_user.id}", headers=headers)
        
        assert response.status_code == 400

    def test_get_project_members(self, client: TestClient, admin_user: User, regular_user: User, sample_project: Project, test_session):
        """Test getting project members"""
        # Add regular_user as member
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_project.id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/projects/{sample_project.id}/members", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        member_ids = [member["id"] for member in data]
        assert regular_user.id in member_ids

    def test_get_projects_by_status(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test getting projects by status"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/projects/status/Active", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for project in data:
            assert project["status"] == "Active"

    def test_get_projects_by_invalid_status(self, client: TestClient, admin_user: User):
        """Test getting projects by invalid status"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/projects/status/InvalidStatus", headers=headers)
        
        assert response.status_code == 400

    def test_project_not_found(self, client: TestClient, admin_user: User):
        """Test accessing non-existent project"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/projects/99999", headers=headers)
        
        assert response.status_code == 404

    def test_unauthorized_access(self, client: TestClient):
        """Test accessing project endpoints without authentication"""
        response = client.get("/api/v1/projects/")
        assert response.status_code == 403

        response = client.post("/api/v1/projects/", json={})
        assert response.status_code == 403

    def test_create_project_validation(self, client: TestClient, admin_user: User):
        """Test project creation with invalid data"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test missing name
        project_data = {
            "description": "Missing name"
        }
        
        response = client.post("/api/v1/projects/", json=project_data, headers=headers)
        assert response.status_code == 422

        # Test name too long
        project_data = {
            "name": "x" * 100,  # Assuming max length is 50
            "description": "Name too long"
        }
        
        response = client.post("/api/v1/projects/", json=project_data, headers=headers)
        assert response.status_code == 422
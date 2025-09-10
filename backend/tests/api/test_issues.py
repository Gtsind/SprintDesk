import pytest
from fastapi.testclient import TestClient
from src.models import User, Project, Issue, Label
from src.models.enums import IssueStatus, IssuePriority
from tests.conftest import get_auth_token, get_auth_headers

class TestIssueEndpoints:
    """Test issue management endpoints"""

    def test_create_issue_as_member(self, client: TestClient, regular_user: User, sample_project: Project, test_session):
        """Test creating issue as project member"""
        # regular_user is already a member via sample_project fixture
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        issue_data = {
            "title": "New Issue",
            "description": "A new test issue",
            "status": "Open",
            "priority": "High",
            "project_id": sample_project.id,
            "assignee_id": regular_user.id
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Issue"
        assert data["description"] == "A new test issue"
        assert data["status"] == "Open"
        assert data["priority"] == "High"
        assert data["project_id"] == sample_project.id
        assert data["author_id"] == regular_user.id
        assert data["assignee_id"] == regular_user.id

    def test_create_issue_as_admin(self, client: TestClient, admin_user: User, regular_user: User, sample_project: Project):
        """Test creating issue as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        issue_data = {
            "title": "Admin Issue",
            "description": "Issue created by admin",
            "project_id": sample_project.id,
            "assignee_id": regular_user.id
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Admin Issue"
        assert data["author_id"] == admin_user.id

    def test_create_issue_as_non_member(self, client: TestClient, regular_user: User, sample_project_base: Project):
        """Test creating issue as non-member (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        issue_data = {
            "title": "Should Fail",
            "project_id": sample_project_base.id
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        
        assert response.status_code == 403

    def test_create_issue_nonexistent_project(self, client: TestClient, regular_user: User):
        """Test creating issue for non-existent project"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        issue_data = {
            "title": "No Project",
            "project_id": 99999
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        
        assert response.status_code == 404

    def test_create_issue_invalid_assignee(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test creating issue with invalid assignee"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        issue_data = {
            "title": "Invalid Assignee",
            "project_id": sample_project.id,
            "assignee_id": 99999
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        
        assert response.status_code == 404

    def test_get_all_issues_as_admin(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test getting all issues as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/issues/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        issue_titles = [issue["title"] for issue in data]
        assert "Test Issue" in issue_titles

    def test_get_all_issues_as_member(self, client: TestClient, regular_user: User, sample_issue: Issue, test_session):
        """Test getting issues as project member"""
        # regular_user is already a member via sample_project fixture
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/issues/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_issue_by_id_as_admin(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test getting issue by ID as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/issues/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_issue.id
        assert data["title"] == "Test Issue"

    def test_get_issue_by_id_as_member(self, client: TestClient, regular_user: User, sample_issue: Issue, test_session):
        """Test getting issue by ID as project member"""
        # regular_user is already a member via sample_project fixture
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/issues/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 200

    def test_get_issue_by_id_unauthorized(self, client: TestClient, regular_user: User, sample_issue_base: Issue):
        """Test getting issue by ID as non-member"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/issues/{sample_issue_base.id}", headers=headers)
        
        assert response.status_code == 403

    def test_update_issue_as_admin(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test updating issue as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "title": "Updated Issue",
            "description": "Updated description",
            "priority": "Critical"
        }
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Issue"
        assert data["description"] == "Updated description"
        assert data["priority"] == "Critical"

    def test_update_issue_as_author(self, client: TestClient, regular_user: User, sample_issue: Issue):
        """Test updating issue as author"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "description": "Author updated description"
        }
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Author updated description"

    def test_update_issue_unauthorized(self, client: TestClient, sample_issue: Issue, test_session):
        """Test updating issue as unauthorized user"""
        # Create another user who is not project member
        from src.models import User
        from src.security.security import get_password_hash
        other_user = User(
            firstname="Other", lastname="User", username="other", email="other@example.com",
            password_hash=get_password_hash("otherpass123"), role="Contributor"
        )
        test_session.add(other_user)
        test_session.commit()
        
        # Register and login as other user
        client.post("/api/v1/auth/register", json={
            "firstname": "Other", "lastname": "User", "username": "other2", 
            "email": "other2@example.com", "password": "otherpass123"
        })
        token = get_auth_token(client, "other2", "otherpass123")
        headers = get_auth_headers(token)
        
        update_data = {"title": "Should Not Update"}
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}", json=update_data, headers=headers)
        
        assert response.status_code == 403

    def test_delete_issue_as_admin(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test deleting issue as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/issues/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 204

    def test_delete_issue_unauthorized(self, client: TestClient, regular_user: User, sample_issue_by_admin: Issue):
        """Test deleting issue as unauthorized user"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/issues/{sample_issue_by_admin.id}", headers=headers)
        
        assert response.status_code == 403

    def test_get_issues_by_project(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test getting issues by project"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/issues/project/{sample_issue.project_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for issue in data:
            assert issue["project_id"] == sample_issue.project_id

    def test_get_issues_by_assignee(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test getting issues by assignee"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/issues/assignee/{sample_issue.assignee_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for issue in data:
            assert issue["assignee_id"] == sample_issue.assignee_id

    def test_get_issues_by_author(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test getting issues by author"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/issues/author/{sample_issue.author_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for issue in data:
            assert issue["author_id"] == sample_issue.author_id

    def test_assign_issue(self, client: TestClient, admin_user: User, regular_user: User, sample_issue: Issue):
        """Test assigning issue to user"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}/assign/{regular_user.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["assignee_id"] == regular_user.id

    def test_unassign_issue(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test unassigning issue (assign to 0)"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}/assign/0", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["assignee_id"] is None

    def test_assign_to_nonexistent_user(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test assigning issue to non-existent user"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}/assign/99999", headers=headers)
        
        assert response.status_code == 404

    def test_close_issue(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test closing issue"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/issues/{sample_issue.id}/close", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Closed"
        assert data["closed_by"] == admin_user.id
        assert data["closed_at"] is not None

    def test_reopen_issue(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test reopening closed issue"""
        # First close the issue
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        client.patch(f"/api/v1/issues/{sample_issue.id}/close", headers=headers)
        
        # Now reopen it
        response = client.patch(f"/api/v1/issues/{sample_issue.id}/reopen", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Open"
        assert data["closed_by"] is None
        assert data["closed_at"] is None

    def test_add_label_to_issue(self, client: TestClient, admin_user: User, sample_issue: Issue, sample_label: Label):
        """Test adding label to issue"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/issues/{sample_issue.id}/labels/{sample_label.id}", headers=headers)
        
        assert response.status_code == 201
        assert "Label added successfully" in response.json()["message"]

    def test_add_duplicate_label_to_issue(self, client: TestClient, admin_user: User, sample_issue: Issue, sample_label: Label, test_session):
        """Test adding duplicate label to issue"""
        # First add the label
        from src.models.intermediate_tables import IssueLabel
        issue_label = IssueLabel(issue_id=sample_issue.id, label_id=sample_label.id)
        test_session.add(issue_label)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.post(f"/api/v1/issues/{sample_issue.id}/labels/{sample_label.id}", headers=headers)
        
        assert response.status_code == 409

    def test_remove_label_from_issue(self, client: TestClient, admin_user: User, sample_issue: Issue, sample_label: Label, test_session):
        """Test removing label from issue"""
        # First add the label
        from src.models.intermediate_tables import IssueLabel
        issue_label = IssueLabel(issue_id=sample_issue.id, label_id=sample_label.id)
        test_session.add(issue_label)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/issues/{sample_issue.id}/labels/{sample_label.id}", headers=headers)
        
        assert response.status_code == 204

    def test_issue_not_found(self, client: TestClient, admin_user: User):
        """Test accessing non-existent issue"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/issues/99999", headers=headers)
        
        assert response.status_code == 404

    def test_unauthorized_access(self, client: TestClient):
        """Test accessing issue endpoints without authentication"""
        response = client.get("/api/v1/issues/")
        assert response.status_code == 403

        response = client.post("/api/v1/issues/", json={})
        assert response.status_code == 403

    def test_create_issue_validation(self, client: TestClient, admin_user: User, sample_project: Project):
        """Test issue creation with invalid data"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test missing title
        issue_data = {
            "description": "Missing title",
            "project_id": sample_project.id
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        assert response.status_code == 422

        # Test missing project_id
        issue_data = {
            "title": "Missing project"
        }
        
        response = client.post("/api/v1/issues/", json=issue_data, headers=headers)
        assert response.status_code == 422
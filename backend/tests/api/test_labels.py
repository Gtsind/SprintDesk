import pytest
from fastapi.testclient import TestClient
from src.models import User, Label, Issue
from tests.conftest import get_auth_token, get_auth_headers

class TestLabelEndpoints:
    """Test label management endpoints"""

    def test_create_label(self, client: TestClient, admin_user: User):
        """Test creating label"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        label_data = {
            "name": "feature",
            "is_active": True
        }
        
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "feature"
        assert data["is_active"] is True
        assert "id" in data

    def test_create_label_as_regular_user(self, client: TestClient, regular_user: User):
        """Test creating label as regular user"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        label_data = {
            "name": "enhancement",
            "is_active": True
        }
        
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "enhancement"

    def test_create_duplicate_label(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test creating label with duplicate name"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        label_data = {
            "name": "bug",  # Same as sample_label
            "is_active": True
        }
        
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        
        assert response.status_code == 400

    def test_get_all_labels(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test getting all labels"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/labels/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        label_names = [label["name"] for label in data]
        assert "bug" in label_names

    def test_get_labels_with_active_filter(self, client: TestClient, admin_user: User, sample_label: Label, test_session):
        """Test getting labels with active filter"""
        # Create an inactive label
        inactive_label = Label(name="inactive", is_active=False)
        test_session.add(inactive_label)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test getting only active labels
        response = client.get("/api/v1/labels/?active=true", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for label in data:
            assert label["is_active"] is True

        # Test getting only inactive labels
        response = client.get("/api/v1/labels/?active=false", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for label in data:
            assert label["is_active"] is False

    def test_get_labels_with_name_filter(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test getting labels with name filter"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/labels/?name=bug", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for label in data:
            assert "bug" in label["name"].lower()

    def test_get_labels_as_non_admin_fails(self, client: TestClient, regular_user: User):
        """Test getting labels with filters as non-admin (should fail for some operations)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        # Getting all labels should work for regular users
        response = client.get("/api/v1/labels/", headers=headers)
        assert response.status_code == 200

    def test_get_label_by_id(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test getting label by ID"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/labels/{sample_label.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_label.id
        assert data["name"] == "bug"

    def test_get_labels_by_issue(self, client: TestClient, admin_user: User, sample_issue: Issue, sample_label: Label, test_session):
        """Test getting labels for a specific issue"""
        # Add label to issue
        from src.models.intermediate_tables import IssueLabel
        issue_label = IssueLabel(issue_id=sample_issue.id, label_id=sample_label.id)
        test_session.add(issue_label)
        test_session.commit()
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/labels/issue/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        label_ids = [label["id"] for label in data]
        assert sample_label.id in label_ids

    def test_update_label(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test updating label"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "name": "critical-bug",
            "is_active": False
        }
        
        response = client.patch(f"/api/v1/labels/{sample_label.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "critical-bug"
        assert data["is_active"] is False

    def test_update_label_partial(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test partially updating label"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "name": "updated-bug"
        }
        
        response = client.patch(f"/api/v1/labels/{sample_label.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "updated-bug"
        assert data["is_active"] is True  # Should remain unchanged

    def test_update_label_duplicate_name(self, client: TestClient, admin_user: User, sample_label: Label, test_session):
        """Test updating label with duplicate name"""
        # Create another label
        another_label = Label(name="another", is_active=True)
        test_session.add(another_label)
        test_session.commit()
        test_session.refresh(another_label)
        
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "name": "bug"  # Same as sample_label
        }
        
        response = client.patch(f"/api/v1/labels/{another_label.id}", json=update_data, headers=headers)
        
        assert response.status_code == 400

    def test_delete_label(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test deleting label"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/labels/{sample_label.id}", headers=headers)
        
        assert response.status_code == 204

    def test_delete_nonexistent_label(self, client: TestClient, admin_user: User):
        """Test deleting non-existent label"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete("/api/v1/labels/99999", headers=headers)
        
        assert response.status_code == 404

    def test_label_not_found(self, client: TestClient, admin_user: User):
        """Test accessing non-existent label"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/labels/99999", headers=headers)
        
        assert response.status_code == 404

    def test_unauthorized_access(self, client: TestClient):
        """Test accessing label endpoints without authentication"""
        response = client.get("/api/v1/labels/")
        assert response.status_code == 403

        response = client.post("/api/v1/labels/", json={})
        assert response.status_code == 403

    def test_create_label_validation(self, client: TestClient, admin_user: User):
        """Test label creation with invalid data"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test missing name
        label_data = {
            "is_active": True
        }
        
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        assert response.status_code == 422

        # Test empty name
        label_data = {
            "name": "",
            "is_active": True
        }
        
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        assert response.status_code == 422

        # Test name too long (assuming max 50 characters)
        label_data = {
            "name": "x" * 51,
            "is_active": True
        }
        
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        assert response.status_code == 422

    def test_update_label_validation(self, client: TestClient, admin_user: User, sample_label: Label):
        """Test label update with invalid data"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test empty name
        update_data = {
            "name": ""
        }
        
        response = client.patch(f"/api/v1/labels/{sample_label.id}", json=update_data, headers=headers)
        assert response.status_code == 422

        # Test name too long
        update_data = {
            "name": "x" * 51
        }
        
        response = client.patch(f"/api/v1/labels/{sample_label.id}", json=update_data, headers=headers)
        assert response.status_code == 422

    def test_get_labels_edge_cases(self, client: TestClient, admin_user: User):
        """Test edge cases for getting labels"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test with non-existent issue ID
        response = client.get("/api/v1/labels/issue/99999", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

        # Test with invalid filter combinations
        response = client.get("/api/v1/labels/?active=invalid", headers=headers)
        assert response.status_code == 422

    def test_label_crud_workflow(self, client: TestClient, admin_user: User):
        """Test complete CRUD workflow for labels"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Create
        label_data = {
            "name": "workflow-test",
            "is_active": True
        }
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        assert response.status_code == 201
        label_id = response.json()["id"]
        
        # Read
        response = client.get(f"/api/v1/labels/{label_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["name"] == "workflow-test"
        
        # Update
        update_data = {"name": "workflow-updated"}
        response = client.patch(f"/api/v1/labels/{label_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["name"] == "workflow-updated"
        
        # Delete
        response = client.delete(f"/api/v1/labels/{label_id}", headers=headers)
        assert response.status_code == 204
        
        # Verify deletion
        response = client.get(f"/api/v1/labels/{label_id}", headers=headers)
        assert response.status_code == 404

    def test_label_case_sensitivity(self, client: TestClient, admin_user: User):
        """Test label name case sensitivity"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Create label with lowercase name
        label_data = {
            "name": "lowercase",
            "is_active": True
        }
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        assert response.status_code == 201
        
        # Try to create label with different case - should be rejected as duplicate (case-insensitive)
        label_data = {
            "name": "LOWERCASE",
            "is_active": True
        }
        response = client.post("/api/v1/labels/", json=label_data, headers=headers)
        assert response.status_code == 400
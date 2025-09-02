# SprintDesk API Tests

This directory contains comprehensive API tests for the SprintDesk backend using pytest, SQLite in-memory database, and FastAPI's TestClient.

## Test Structure

```
tests/
├── conftest.py                 # Test configuration and fixtures
├── api/
│   ├── test_auth.py           # Authentication endpoint tests
│   ├── test_users.py          # User management endpoint tests  
│   ├── test_projects.py       # Project management endpoint tests
│   ├── test_issues.py         # Issue tracking endpoint tests
│   ├── test_comments.py       # Comment system endpoint tests
│   └── test_labels.py         # Label management endpoint tests
└── README.md                  # This file
```

## Setup

1. Install test dependencies:
```bash
pip install -r requirements-test.txt
```

2. Run all tests:
```bash
pytest
```

3. Run tests with coverage:
```bash
pytest --cov=src --cov-report=html
```

4. Run specific test files:
```bash
pytest tests/api/test_auth.py
pytest tests/api/test_users.py -v
```

5. Run tests by markers:
```bash
pytest -m "not slow"
pytest -m "api"
```

## Test Features

### Database Setup
- Uses SQLite in-memory database for each test
- Automatic table creation and cleanup
- Fast test execution with no persistent state

### Authentication Testing
- JWT token generation and validation
- Role-based access control testing
- User registration and login flows

### Comprehensive Coverage
- **Authentication**: Registration, login, token validation
- **Users**: CRUD operations, role management, activation/deactivation
- **Projects**: Project lifecycle, member management, access control
- **Issues**: Issue tracking, assignment, status management, labeling
- **Comments**: Comment creation, updates, thread management
- **Labels**: Label management, issue associations

### Test Utilities
- Pre-configured user fixtures (admin, regular, project manager, inactive)
- Sample data fixtures (projects, issues, comments, labels)
- Authentication helpers for token generation
- Database session management

## Key Test Scenarios

### Security Testing
- Authorization checks for all endpoints
- Role-based permissions (Admin, Project Manager, Contributor)
- Project membership validation
- Token expiration and validation

### Data Validation
- Input validation for all API endpoints
- Required field validation
- Field length and format constraints
- Duplicate prevention (usernames, emails, label names)

### Business Logic
- Project member management
- Issue assignment workflows
- Comment threading and permissions
- Label-issue associations
- User activation/deactivation flows

### Error Handling
- 401 Unauthorized for authentication failures
- 403 Forbidden for authorization failures
- 404 Not Found for missing resources
- 409 Conflict for duplicate resources
- 422 Unprocessable Entity for validation errors

## Running Tests

### Basic Commands
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test class
pytest tests/api/test_auth.py::TestAuthEndpoints

# Run specific test method
pytest tests/api/test_users.py::TestUserEndpoints::test_create_user_as_admin
```

### Coverage Commands
```bash
# Generate coverage report
pytest --cov=src

# Generate HTML coverage report
pytest --cov=src --cov-report=html

# Set minimum coverage threshold
pytest --cov=src --cov-fail-under=80
```

### Test Filtering
```bash
# Skip slow tests
pytest -m "not slow"

# Run only API tests
pytest -m "api"

# Run tests matching pattern
pytest -k "auth"
pytest -k "create"
```

## Test Data

All tests use isolated, in-memory SQLite databases with the following fixtures:
- **admin_user**: Administrator with full permissions
- **regular_user**: Standard contributor user
- **project_manager_user**: User with project management permissions
- **inactive_user**: Deactivated user for testing access restrictions
- **sample_project**: Test project for relationship testing
- **sample_issue**: Test issue with full relationships
- **sample_comment**: Test comment linked to issue
- **sample_label**: Test label for categorization

## Best Practices

1. **Isolation**: Each test runs with a fresh database
2. **Authentication**: Helper functions for token generation
3. **Assertions**: Clear, specific assertions for API responses
4. **Coverage**: Tests cover both success and failure scenarios
5. **Documentation**: Clear test names and docstrings
6. **Maintainability**: Shared fixtures and utilities reduce duplication

## Continuous Integration

These tests are designed to run in CI/CD pipelines with:
- No external dependencies (uses in-memory database)
- Fast execution time
- Clear pass/fail indicators
- Coverage reporting
- Detailed error messages for debugging

## Contributing

When adding new API endpoints or modifying existing ones:
1. Add corresponding tests in the appropriate test file
2. Update fixtures if new models are introduced
3. Ensure tests cover both positive and negative scenarios
4. Maintain test isolation and independence
5. Update this README if new test patterns are introduced
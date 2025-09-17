# SprintDesk

**SprintDesk** is a modern project management application that helps teams plan, track, and collaborate effectively. It combines issue tracking, role-based dashboards, and real-time discussions into a clean and intuitive interface. Built with **FastAPI, SQLModel, and PostgreSQL** on the backend and **React + TailwindCSS** on the frontend, SprintDesk delivers both performance and usability for team-driven projects.

**Key Features:**

- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Admin, Project Manager, Contributor)
- **Project Management**: Create, manage, and track multiple projects with different statuses (Active, Completed, On Hold, Cancelled)
- **Issue Tracking System**: Comprehensive issue management with status tracking (Open, In Progress, Review Ready, Closed, Blocked), priority levels (Low, Medium, High, Critical), and time estimation
- **Team Collaboration**: Multi-user support with project membership management and role-based permissions
- **Interactive Dashboards**: Role-specific dashboards with charts and analytics using Recharts
- **Label System**: Organize and categorize issues with customizable labels
- **Comment System**: Real-time discussion threads on issues for team communication
- **Optimized Client-Side Navigation**: Lightweight, fully custom routing ensures fast page transitions

## How it Works

### 1. Authentication & User Onboarding

- **Login / Registration**: On load, users see a clean authentication screen with options to **Sign In** or **Sign Up**.

  - Clicking **Sign Up** opens the registration page where users provide personal information. Usernames and emails must be unique, and passwords must be at least 8 characters.
  - Clicking **Sign In** with valid credentials logs the user in; invalid credentials display an appropriate error.
  - A **Sign In** button on the registration page allows users to return to login.

- **Role Assignment**: New users are assigned the **Contributor** role by default. Admins can later change user roles through the **Users** page. Roles determine access levels throughout the application.

- **Dashboard Redirect**: Successful authentication automatically redirects users to the dashboard.

### 2. Role-Based Dashboard Experience

- All users see a header with:

  - **SprintDesk** button (always redirects to the dashboard)
  - Breadcrumbs
  - Their name (clicking shows profile) and **Logout** button

- Sidebar navigation:

  - Buttons for **Dashboard**, **Projects**, **Issues**, and **Preferences** (currently inactive; see Future Work)
  - **Admin users** also see **Users**

- **Dashboard Content**: Interactive charts summarize key information; clicking charts applies context-specific filters and redirects as needed.

**Admin Dashboard**

- System-wide overview: "Users by Role", "Projects by Status", "Open Issues by Project"
- Global statistics

**Project Manager Dashboard**

- Project-focused: "Active Issues by Status", "Active Issues by Priority", "Team Workload"
- Project analytics and progress visualization

**Contributor Dashboard**

- Personal task view: "My Issues by Status", "Workload by Priority", "My Issues by Project"
- Overview across all projects the user is a member of

### 3. User Management Workflow (Admin Only)

- **User Creation**: Admins can view, create, edit, deactivate/activate, or delete users through the **Users** page.

### 4. Project Management Workflow

- **Project Creation**: Admins and Project Managers can create new projects with descriptions and initial settings.
- **Team Assembly**: Add team members to projects with appropriate roles.
- **Status Tracking**: Monitor project progress through updates and analytics.

### 5. Issue Management System

- **Issue Creation**: Users can create issues either from the **Project Details** page or the global **Issues** page. The Issues page requires selecting a project first.
- **Assignment Process**: Assign issues to team members with priority and time estimates.
- **Status Progression**: Track issues through their lifecycle with visual indicators.
- **Label Organization**: Use color-coded labels to categorize issues.
- **Discussion Threads**: Contextual comments allow team communication on individual issues.

## How to Run

Follow these comprehensive instructions to set up and run SprintDesk on your local machine.

### Requirements

**System Requirements:**

- **Node.js**: v22.15.0
- **npm**: 11.5.2
- **Python**: 3.13.5
- **PostgreSQL**: 17

Note: The application was developed and tested with the above versions. Earlier versions of these tools may not be fully supported.

### How to Set Up

#### 1. Clone the Repository

```bash
git clone https://github.com/Gtsind/SprintDesk.git
cd SprintDesk
```

#### 2. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# On Windows: Download from https://www.postgresql.org/download/windows/
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
# On Windows: Start from Services or pgAdmin
# On macOS: brew services start postgresql
# On Linux: sudo systemctl start postgresql

# Connect to postgresql (You will be prompted for your password)
# On Windows:
psql -U postgres
# On macOS/Linux:
sudo -u postgres psql

# Create database and user
CREATE DATABASE sprintdesk_db;
CREATE USER sprintdesk_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sprintdesk_db TO sprintdesk_admin;

# Connect to the database and grant schema permissions
\c sprintdesk_db
GRANT ALL ON SCHEMA public TO sprintdesk_admin;
\q
```

#### 3. Backend Setup

Open two terminals. We will use terminal 1 to setup the backend and terminal 2 to setup the frontend.

**Terminal 1**

```bash
# Navigate to backend directory
cd backend

# Create environment file
# On Windows:
copy .env.example .env
#On macOS/Linus:
cp .env.example .env

# Edit the .env file with your specific values
# Ensure SECRET_KEY is long and random for production use
DB_USER=sprintdesk_admin
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sprintdesk_db
SECRET_KEY=your-super-secret-key-change-this-in-production-make-it-long-and-random
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Create virtual environment (replace your-venv-name with any name of your choice)
# On Windows:
python -m venv your-venv-name
# On macOS/Linux:
python3 -m venv your-venv-name

# Activate virtual environment (replace your-venv-name with the name you gave to your venv above)
# On Windows:
your-venv-name\Scripts\activate
# On macOS/Linux:
source venv-sprint/bin/activate

# You should now see (your-venv-name) in your terminal.

# Install dependencies
pip install -r requirements.txt
```

#### 4. Frontend Setup

**Terminal 2**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Verify installation
npm run build
```

#### 5. Start the Application

```bash
# Terminal 1: Start Backend (from backend directory, activate virtual environment if not already active)
python -m src.main
# Backend will be available at http://localhost:8000

# Terminal 2: Start Frontend (from frontend directory)
npm run dev
# Frontend will be available at http://localhost:5173
```

#### 6. Create Demo Users (Recommended)

**Important**: New registrations default to "Contributor" role with limited permissions. To fully explore SprintDesk, create demo users with different roles:

```bash
# Open a new terminal and navigate to the backend (make sure backend is running)
# Activate the virtual environment if not already active
cd backend
python create_demo_users.py
```

This creates three users:

- **Admin** - Username: `admin`, Password: `12345678` (full system access)
- **Project Manager** - Username: `manager`, Password: `12345678` (can create/manage projects)
- **Contributor** - Username: `contributor`, Password: `12345678` (can work on assigned issues)

#### 7. Initial Run & Verification

- Navigate to `http://localhost:5173` in your web browser
- Log in with any of the demo accounts above, or create your own account (defaults to Contributor role)
- The database will be automatically initialized on first backend startup
- API documentation is available at `http://localhost:8000/docs`

## How to Test

### Backend Testing

The tests directory contains comprehensive API tests for the SprintDesk backend using pytest, SQLite in-memory database, and FastAPI's TestClient.

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

```bash
cd backend

# Install test dependencies
pip install -r requirements-test.txt

# Basic Test Commands - Run all tests (132 tests across 6 test files)
pytest

# Run all tests with verbose output
pytest -v

# Coverage Commands - Run tests with coverage report (HTML generated automatically)
pytest --cov=src --cov-report=html

# Specific Test File Commands - Example: Run authentication tests only (13 tests)
pytest tests/api/test_auth.py

# Specific Test Method Commands - Run single test method (e.g., admin user creation test)
pytest tests/api/test_users.py::TestUserEndpoints::test_create_user_as_admin

# Pattern Matching Commands - Examples below for keywords "auth" "create" and "admin" - You can use any keyword you want
pytest -k "auth"
pytest -k "create"
pytest -k "admin"

# View Coverage Reports in terminal
coverage report

# View detailed coverage report in browser
# On Windows:
start htmlcov\index.html
# On macOS/Linux:
open htmlcov/index.html
```

### Frontend Testing

No automated test framework is currently configured for the frontend.  
Instead, core functionality was verified through a **manual testing checklist** (below).  
Future work may add Jest, React Testing Library, and Cypress/Playwright for automated coverage.

#### Manual Testing Checklist

1. **Authentication Flow**:

   - Register new user account
   - Login with created credentials
   - Verify JWT token functionality
   - Test logout functionality

2. **Project Management**:

   - Create new project
   - Add team members
   - Update project status
   - Delete project (Admin/PM only)

3. **Issue Tracking**:

   - Create issues with different priorities
   - Assign issues to team members
   - Update issue status
   - Add comments and labels
   - Test time estimation features

4. **Dashboard Functionality**:
   - Verify role-specific dashboard content
   - Test chart interactions
   - Confirm data accuracy across views

## File Structure

<details>
<summary><strong>Click to expand/collapse the detailed file structure</strong></summary>

```
SprintDesk/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── ContributorDashboard.tsx
│   │   │   │   └── ProjectManagerDashboard.tsx
│   │   │   ├── issue/
│   │   │   │   ├── sidebar/
│   │   │   │   │   ├── AssigneeDropdown.tsx
│   │   │   │   │   ├── IssueMetadata.tsx
│   │   │   │   │   ├── PriorityDropdown.tsx
│   │   │   │   │   ├── StatusDropdown.tsx
│   │   │   │   │   └── TimeEstimateEditor.tsx
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── IssueDescription.tsx
│   │   │   │   ├── IssueHeader.tsx
│   │   │   │   └── IssueSidebar.tsx
│   │   │   ├── labels/
│   │   │   │   ├── CreateLabelForm.tsx
│   │   │   │   ├── LabelBadge.tsx
│   │   │   │   ├── LabelMenu.tsx
│   │   │   │   └── LabelsSection.tsx
│   │   │   ├── layout/
│   │   │   │   ├── BreadCrumbs.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── SideBar.tsx
│   │   │   ├── modals/
│   │   │   │   ├── DeleteConfirmationModal.tsx
│   │   │   │   ├── DisplayErrorModal.tsx
│   │   │   │   ├── IssueCreateModal.tsx
│   │   │   │   ├── IssueCreateWrapperModal.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ProjectCreateModal.tsx
│   │   │   │   └── UserCreateModal.tsx
│   │   │   ├── project/
│   │   │   │   ├── IssuesTab.tsx
│   │   │   │   ├── MemberDropdown.tsx
│   │   │   │   ├── MembersTab.tsx
│   │   │   │   ├── ProjectHeader.tsx
│   │   │   │   ├── ProjectStatusDropdown.tsx
│   │   │   │   └── TabNavigation.tsx
│   │   │   ├── toolbar/
│   │   │   │   ├── ActiveFilterBadges.tsx
│   │   │   │   ├── FilterDropdown.tsx
│   │   │   │   ├── FilterOption.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── Toolbar.tsx
│   │   │   ├── ui/
│   │   │   │   ├── ActionButtons.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── ListCard.tsx
│   │   │   │   ├── LoadingIcon.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   └── user/
│   │   │       └── EditableField.tsx
│   │   ├── contexts/
│   │   │   ├── auth.ts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useApi.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useCommentActions.ts
│   │   │   ├── useDropdown.ts
│   │   │   ├── useInlineEdit.ts
│   │   │   ├── useIssueActions.ts
│   │   │   ├── useLabels.ts
│   │   │   ├── useProjectActions.ts
│   │   │   ├── useProjectFiltering.ts
│   │   │   └── useTabManagement.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── IssueDetailPage.tsx
│   │   │   ├── IssuesPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProjectDetailsPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── UserDetailsPage.tsx
│   │   │   └── UsersPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── toolbar.ts
│   │   ├── utils/
│   │   │   ├── breadcrumbs.ts
│   │   │   ├── chartNavigation.ts
│   │   │   ├── colors.ts
│   │   │   ├── dashboardUtils.ts
│   │   │   ├── errorHandling.ts
│   │   │   ├── filterConfigs.ts
│   │   │   ├── getModalProps.ts
│   │   │   ├── icons.tsx
│   │   │   └── userConfig.tsx
│   │   ├── App.tsx
│   │   ├── AppRouter.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── comments.py
│   │   │       ├── issues.py
│   │   │       ├── labels.py
│   │   │       ├── projects.py
│   │   │       └── users.py
│   │   ├── dto/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── comment.py
│   │   │   ├── issue.py
│   │   │   ├── label.py
│   │   │   ├── project.py
│   │   │   └── user.py
│   │   ├── exceptions/
│   │   │   ├── __init__.py
│   │   │   ├── auth_exceptions.py
│   │   │   ├── base_exception.py
│   │   │   ├── comment_exceptions.py
│   │   │   ├── issue_exceptions.py
│   │   │   ├── label_exceptions.py
│   │   │   ├── project_exceptions.py
│   │   │   └── user_exceptions.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── comment.py
│   │   │   ├── enums.py
│   │   │   ├── intermediate_tables.py
│   │   │   ├── issue.py
│   │   │   ├── label.py
│   │   │   ├── project.py
│   │   │   └── user.py
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── base_repository.py
│   │   │   ├── comment_repository.py
│   │   │   ├── issue_repository.py
│   │   │   ├── label_repository.py
│   │   │   ├── project_repository.py
│   │   │   └── user_repository.py
│   │   ├── security/
│   │   │   ├── auth_dependencies.py
│   │   │   └── security.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── comment_service.py
│   │   │   ├── issue_service.py
│   │   │   ├── label_service.py
│   │   │   ├── project_service.py
│   │   │   └── user_service.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── test_auth.py
│   │   │   ├── test_comments.py
│   │   │   ├── test_issues.py
│   │   │   ├── test_labels.py
│   │   │   ├── test_projects.py
│   │   │   └── test_users.py
│   │   ├── __init__.py
│   │   └── conftest.py
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── create_demo_users.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── requirements-test.txt
├── .gitignore
└── README.md
```

</details>

## Tech Stack

### Backend

- **Framework**: FastAPI 0.116.1
- **Database**: PostgreSQL + SQLModel 0.0.24
- **Authentication**: JWT (python-jose 3.5.0) + bcrypt 4.3.0
- **Validation**: Pydantic 2.11.7
- **Testing**: pytest 8.4.1 with asyncio and coverage
- **Server**: Uvicorn 0.35.0
- **Architecture**: Clean Architecture (Repository & Service layers)
- **CORS**: Configured for multiple origins

### Frontend

- **Framework**: React 19.1.1 + TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Styling**: TailwindCSS 4.1.12
- **Charts**: Recharts 3.2.0
- **Icons**: Lucide React 0.542.0
- **State Management**: React Context API
- **Routing**: Custom client-side routing

### Development Tools

- **Frontend**: Vite HMR
- **Backend**: Uvicorn auto-reload
- **Code Quality**: ESLint with TypeScript rules
- **API Docs**: FastAPI OpenAPI
- **Database**: SQLModel with automatic migrations

## Environment Variables

| Variable                      | Description                          | Required | Default | Example                                      |
| ----------------------------- | ------------------------------------ | -------- | ------- | -------------------------------------------- |
| `DB_USER`                     | PostgreSQL database username         | Yes      | -       | `sprintdesk_admin`                           |
| `DB_PASSWORD`                 | PostgreSQL database password         | Yes      | -       | `secure_password_123`                        |
| `DB_HOST`                     | Database server hostname             | Yes      | -       | `localhost`                                  |
| `DB_PORT`                     | Database server port                 | Yes      | -       | `5432`                                       |
| `DB_NAME`                     | Database name                        | Yes      | -       | `sprintdesk_db`                              |
| `SECRET_KEY`                  | JWT signing secret key               | Yes      | -       | `your-super-secret-key-change-in-production` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration time in minutes | No       | `30`    | `60`                                         |

## Optimization

SprintDesk is designed for **performance and maintainability** through:

- **Frontend**: Vite for fast builds, TypeScript strict mode, code-splitting, TailwindCSS purging, lightweight custom routing, and optimized React Context usage.
- **Backend**: FastAPI with async/await, SQLModel ORM with indexing & relationship optimization, connection pooling, and centralized error handling.
- **Architecture**: Clean Architecture with Repository + Service layers, strong typing across frontend & backend, and minimal dependencies.
- **Charts**: Interactive dashboards built with Recharts allow click-through filtering and navigation, reducing redundant page loads.
- **Development**: Hot Module Reloading (Vite + Uvicorn), automated testing with pytest, and ESLint with TypeScript + React rules for consistent code quality.

## Future Work

The following enhancements would extend SprintDesk's capabilities and improve user experience:

- **Core Features**: Real-time updates (WebSockets), file attachments, advanced search, notifications, and sprint planning.
- **UX**: Preferences page implementation (referenced in navigation), mobile support, dark mode, customizable dashboards, advanced filtering, and offline/PWA features.
- **Integrations**: GitHub/GitLab, Slack, calendar sync, GraphQL, and plugin support.
- **DevOps**: CI/CD pipeline, Dockerization, Alembic migrations, monitoring, and scalability improvements.
- **Security**: MFA, audit logs, rate limiting, encryption, and advanced session management.
- **Admin Tools**: Backups, advanced user/group management, and analytics dashboards.

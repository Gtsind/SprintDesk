from enum import Enum

class UserRole(str, Enum):
    ADMIN = "Admin"
    PROJECT_MANAGER = "Project Manager"
    CONTRIBUTOR = "Contributor"

class ProjectStatus(str, Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"
    ON_HOLD = "On Hold"
    CANCELLED = "Cancelled"

class IssueStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    READY_FOR_REVIEW = "Ready For Review"
    CLOSED = "Closed"
    BLOCKED = "Blocked"

class IssuePriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"
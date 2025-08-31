from src.exceptions.base_exception import AppException

class IssueAssigneeError(AppException):
    """Raised when trying to assign an issue to a user that is not a member of the project"""
    def __init__(self, message: str = "Cannot assign issues to members not involved in the project."):
        super().__init__(message)

class IssueNotFoundError(AppException):
    """Raised when trying to find an issue that doesn't exist in the database."""
    def __init__(self, message: str = "Issue not found."):
        super().__init__(message)
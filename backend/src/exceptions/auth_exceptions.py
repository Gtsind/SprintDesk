from src.exceptions.base_exception import AppException

class InvalidTokenError(AppException):
    """Raised when a token is invalid or expired"""
    def __init__(self, message: str = "Invalid or expired token."):
        super().__init__(message)

class InvalidTokenPayloadError(AppException):
    """Raised when a token payload is missing required fields"""
    def __init__(self, message: str = "Invalid token payload."):
        super().__init__(message)

class NotAuthorizedError(AppException):
    """Raised when a user tries to perform an action they are not allowed to."""
    def __init__(self, message: str = "Not authorized to perform this action."):
        super().__init__(message)
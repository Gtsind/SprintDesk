from src.exceptions.base_exception import AppException

class UsernameAlreadyExistsError(AppException):
    """Raised when trying to create a user with a username that already exists in the database."""
    def __init__(self, message: str = "Username already exists."):
        super().__init__(message)

class EmailAlreadyExistsError(AppException):
    """Raised when trying to create a user with an email that already exists in the database."""
    def __init__(self, message: str = "Email already exists."):
        super().__init__(message)

class IncorrectPasswordError(AppException):
    """Raised when a user tries to login with a password that doesn't match the one stored in the database."""
    def __init__(self, message: str = "Incorrect password."):
        super().__init__(message)

class InvalidUsernameError(AppException):
    """Raised when a user tries to login with a username that doesn't exist in the database."""
    def __init__(self, message: str = "Username does not exist."):
        super().__init__(message)

class InactiveUserAccountError(AppException):
    """Raised when a user is trying to login with an inactive account's credentials."""
    def __init__(self, message: str = "Cannot login. Your account is inactive."):
        super().__init__(message)

class UserNotFoundError(AppException):
    """Raised when trying to find a user that doesn't exist in the database."""
    def __init__(self, message: str = "User not found."):
        super().__init__(message)
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App settings
    app_name: str = "SprintDesk"
    app_version: str = "1.0.0"
    app_description: str = "A lightweight issue tracking system for tech teams"

    # DB settings
    db_user: str = os.getenv("DB_USER", "sprintdesk_admin")
    db_password: str = os.getenv("DB_PASSWORD", "password") 
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: str = os.getenv("DB_PORT", "5432")
    db_name: str = os.getenv("DB_NAME", "sprintdesk_db")

    # Security settings
    secret_key: str = os.getenv("SECRET_KEY", "my-super-secret-key-change-this-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # CORS settings
    allowed_origins: list[str] = [
        "http://localhost:3000", # React dev server
        "http://localhost:5173", # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173"
    ]

    @property
    def database_url(self) -> str:
        return f"postgresql+psycopg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
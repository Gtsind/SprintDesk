from sqlmodel import SQLModel, create_engine, Session
from functools import lru_cache
from src.config import settings

class DatabaseConfig:
    def __init__(self) -> None:
        self.database_url = settings.database_url
        self.engine = self._create_engine()

    def _create_engine(self):
        """Create SQLModel engine"""
        return create_engine(
            self.database_url,
            echo=True,
            pool_pre_ping=True, # check if db connection is alive before using it
            pool_recycle=300 # recycle connection every 5 minutes
        )
    
    def create_db_and_tables(self):
        """Create all database tables"""
        SQLModel.metadata.create_all(self.engine)

    def get_session(self) -> Session:
        """Get database session"""
        return Session(self.engine)
    
@lru_cache
def get_database() -> DatabaseConfig:
    return DatabaseConfig()

def get_db_session():
    """FastAPI dependency to get database session"""
    db = get_database()
    with db.get_session() as session:
        yield session

def init_db():
    """Initialize database - create tables"""
    db = get_database()
    db.create_db_and_tables()
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()
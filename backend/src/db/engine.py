from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL_ENV = os.getenv("DATABASE_URL")
if DATABASE_URL_ENV is None:
    raise RuntimeError("DATABASE_URL environment variable not set")
DATABASE_URL: str = DATABASE_URL_ENV

engine = create_engine(DATABASE_URL, echo=True)
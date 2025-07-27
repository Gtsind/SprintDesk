from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL: str = str(os.getenv("DATABASE_URL"))

engine = create_engine(DATABASE_URL, echo=True)
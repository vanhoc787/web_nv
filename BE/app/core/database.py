import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

from ..models.personnel import Personnel
from ..models.user import User
from ..services.user_service import ensure_admin_user

load_dotenv(Path(__file__).resolve().parents[2] / '.env')

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        ensure_admin_user(session)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

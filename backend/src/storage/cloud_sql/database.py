"""Cloud SQL — SQLAlchemy async engine and session factory."""

import os
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


def build_dsn() -> str:
    user = os.environ["DB_USER"]
    password = os.environ["DB_PASSWORD"]
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "5432")
    name = os.environ["DB_NAME"]
    return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"


_engine: AsyncEngine | None = None


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        _engine = create_async_engine(build_dsn(), echo=os.getenv("APP_ENV") == "development")
    return _engine


def get_session_factory() -> sessionmaker:
    return sessionmaker(get_engine(), class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncSession:
    """FastAPI dependency for a DB session."""
    factory = get_session_factory()
    async with factory() as session:
        yield session

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

db_url = settings.get_database_url()

# Fallback to SQLite if asyncpg is not installed on host environment (e.g. testing)
if "asyncpg" in db_url:
    try:
        import asyncpg  # noqa: F401
    except ImportError:
        db_url = "sqlite+aiosqlite:///./trackr.db"

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
import uuid

from .config import get_settings
from ..models.data import Base

# Global engine and session maker
_engine = None
_async_session_maker = None


def get_engine():
    """Get or create SQLAlchemy async engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url,
            echo=settings.debug,
            future=True
        )
    return _engine


def get_session_maker():
    """Get or create async session maker."""
    global _async_session_maker
    if _async_session_maker is None:
        engine = get_engine()
        _async_session_maker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    return _async_session_maker


async def init_db():
    """Initialize database tables."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions."""
    session_maker = get_session_maker()
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Utility functions
def parse_date(date_str: str) -> datetime:
    """Parse date string to datetime object."""
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}")


def format_timestamp(dt: datetime) -> str:
    """Format datetime to ISO 8601 string."""
    return dt.isoformat()


def generate_id(prefix: str = "") -> str:
    """Generate unique ID."""
    unique_id = str(uuid.uuid4())[:8]
    return f"{prefix}_{unique_id}" if prefix else unique_id


def calculate_date_range(start: str, end: str) -> tuple[datetime, datetime]:
    """Validate and parse date range."""
    start_dt = parse_date(start)
    end_dt = parse_date(end)

    if start_dt >= end_dt:
        raise ValueError("Start date must be before end date")

    return start_dt, end_dt

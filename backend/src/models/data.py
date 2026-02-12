from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# SQLAlchemy ORM Models (for database persistence)
class OHLCVRecord(Base):
    """Database table for storing OHLCV data."""

    __tablename__ = "ohlcv_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_symbol_timestamp", "symbol", "timestamp"),
    )


# Pydantic Models (for API validation and serialization)
class OHLCVData(BaseModel):
    """Single OHLCV data point."""

    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

    class Config:
        from_attributes = True


class OHLCVRequest(BaseModel):
    """Request model for fetching OHLCV data."""

    symbol: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    interval: str = "daily"  # daily, intraday


class OHLCVResponse(BaseModel):
    """Response model containing OHLCV data."""

    symbol: str
    data: List[OHLCVData]
    cached: bool = False

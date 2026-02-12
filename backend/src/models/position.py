from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel


class Position(BaseModel):
    """Trading position with entry and exit details."""

    id: str
    timestamp: datetime
    type: Literal["long", "short"]
    entry_price: float
    exit_price: Optional[float] = None
    quantity: float
    pnl: Optional[float] = None

    class Config:
        from_attributes = True


class PositionCreate(BaseModel):
    """Model for opening a new position."""

    timestamp: datetime
    type: Literal["long", "short"]
    entry_price: float
    quantity: float


class PositionClose(BaseModel):
    """Model for closing an existing position."""

    position_id: str
    timestamp: datetime
    exit_price: float
    pnl: float

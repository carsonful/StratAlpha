from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


class Indicator(BaseModel):
    """Technical indicator definition."""

    id: str
    name: str
    type: str  # sma, ema, rsi, macd, bollinger, etc.
    parameters: Dict[str, Any] = Field(default_factory=dict)


class Condition(BaseModel):
    """Trading condition/rule."""

    id: str
    indicator: str  # Reference to indicator name or another indicator
    operator: Literal["gt", "lt", "eq", "gte", "lte"]
    value: float | str  # Can be a number or reference to another indicator


class Strategy(BaseModel):
    """Complete trading strategy definition."""

    id: str
    name: str
    description: Optional[str] = None
    indicators: List[Indicator]
    conditions: List[Condition]


class StrategyValidationError(BaseModel):
    """Validation error for strategy."""

    field: str
    message: str


class StrategyValidationResponse(BaseModel):
    """Response from strategy validation."""

    valid: bool
    errors: List[StrategyValidationError] = Field(default_factory=list)

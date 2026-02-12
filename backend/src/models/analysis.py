from typing import List, Optional
from pydantic import BaseModel
from .position import Position
from .strategy import Strategy


class BacktestRequest(BaseModel):
    """Request model for running a backtest."""

    symbol: str
    start_date: str
    end_date: str
    strategy: Strategy
    initial_capital: float = 10000.0


class PerformanceMetrics(BaseModel):
    """Additional performance metrics."""

    total_trades: int
    winning_trades: int
    losing_trades: int
    avg_win: float
    avg_loss: float
    profit_factor: Optional[float] = None
    avg_trade_duration: Optional[float] = None


class BacktestResult(BaseModel):
    """Complete backtest results with metrics and positions."""

    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    positions: List[Position]
    metrics: Optional[PerformanceMetrics] = None
    final_capital: Optional[float] = None


class EquityCurvePoint(BaseModel):
    """Single point on the equity curve."""

    timestamp: str
    equity: float
    drawdown: float


class EquityCurveResponse(BaseModel):
    """Equity curve data for visualization."""

    curve: List[EquityCurvePoint]

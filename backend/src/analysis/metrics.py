import pandas as pd
import numpy as np
from typing import List, Optional

from ..models.position import Position
from ..models.analysis import PerformanceMetrics, EquityCurvePoint


class MetricsCalculator:
    """Calculate backtest performance metrics."""

    @staticmethod
    def calculate_total_return(positions: List[Position], initial_capital: float) -> float:
        """
        Calculate total return percentage.

        Args:
            positions: List of closed positions
            initial_capital: Starting capital

        Returns:
            Total return as percentage
        """
        total_pnl = sum(p.pnl for p in positions if p.pnl is not None)
        final_capital = initial_capital + total_pnl

        if initial_capital == 0:
            return 0.0

        return ((final_capital - initial_capital) / initial_capital) * 100

    @staticmethod
    def calculate_sharpe_ratio(
        equity_curve: List[tuple],
        risk_free_rate: float = 0.0
    ) -> float:
        """
        Calculate Sharpe Ratio.

        Args:
            equity_curve: List of (timestamp, equity) tuples
            risk_free_rate: Annual risk-free rate (default: 0%)

        Returns:
            Sharpe ratio (annualized)
        """
        if len(equity_curve) < 2:
            return 0.0

        # Calculate returns
        equities = [e[1] for e in equity_curve]
        returns = pd.Series(equities).pct_change().dropna()

        if len(returns) == 0 or returns.std() == 0:
            return 0.0

        # Annualize (assuming daily data)
        mean_return = returns.mean() * 252
        std_return = returns.std() * np.sqrt(252)

        sharpe = (mean_return - risk_free_rate) / std_return

        return float(sharpe)

    @staticmethod
    def calculate_max_drawdown(equity_curve: List[tuple]) -> float:
        """
        Calculate maximum drawdown percentage.

        Args:
            equity_curve: List of (timestamp, equity) tuples

        Returns:
            Maximum drawdown as negative percentage
        """
        if len(equity_curve) == 0:
            return 0.0

        equities = [e[1] for e in equity_curve]
        equity_series = pd.Series(equities)

        # Calculate running maximum
        running_max = equity_series.expanding().max()

        # Calculate drawdown
        drawdown = (equity_series - running_max) / running_max * 100

        max_dd = drawdown.min()

        return float(max_dd) if not np.isnan(max_dd) else 0.0

    @staticmethod
    def calculate_win_rate(positions: List[Position]) -> float:
        """
        Calculate win rate percentage.

        Args:
            positions: List of closed positions

        Returns:
            Win rate as percentage
        """
        if len(positions) == 0:
            return 0.0

        winning_trades = sum(1 for p in positions if p.pnl is not None and p.pnl > 0)

        return (winning_trades / len(positions)) * 100

    @staticmethod
    def calculate_performance_metrics(positions: List[Position]) -> PerformanceMetrics:
        """
        Calculate additional performance metrics.

        Args:
            positions: List of closed positions

        Returns:
            PerformanceMetrics object
        """
        if len(positions) == 0:
            return PerformanceMetrics(
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                avg_win=0.0,
                avg_loss=0.0,
                profit_factor=None
            )

        winning_trades = [p for p in positions if p.pnl is not None and p.pnl > 0]
        losing_trades = [p for p in positions if p.pnl is not None and p.pnl < 0]

        avg_win = np.mean([p.pnl for p in winning_trades]) if winning_trades else 0.0
        avg_loss = np.mean([abs(p.pnl) for p in losing_trades]) if losing_trades else 0.0

        # Profit factor
        total_wins = sum(p.pnl for p in winning_trades)
        total_losses = sum(abs(p.pnl) for p in losing_trades)
        profit_factor = total_wins / total_losses if total_losses > 0 else None

        return PerformanceMetrics(
            total_trades=len(positions),
            winning_trades=len(winning_trades),
            losing_trades=len(losing_trades),
            avg_win=float(avg_win),
            avg_loss=float(avg_loss),
            profit_factor=float(profit_factor) if profit_factor is not None else None
        )

    @staticmethod
    def generate_equity_curve(
        positions: List[Position],
        initial_capital: float
    ) -> List[EquityCurvePoint]:
        """
        Generate equity curve with drawdown.

        Args:
            positions: List of closed positions
            initial_capital: Starting capital

        Returns:
            List of EquityCurvePoint objects
        """
        curve = []
        running_capital = initial_capital
        running_max = initial_capital

        for position in positions:
            if position.pnl is not None:
                running_capital += position.pnl
                running_max = max(running_max, running_capital)

                drawdown = ((running_capital - running_max) / running_max) * 100 if running_max > 0 else 0.0

                curve.append(EquityCurvePoint(
                    timestamp=position.timestamp.isoformat(),
                    equity=running_capital,
                    drawdown=drawdown
                ))

        return curve

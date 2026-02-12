import pandas as pd
from typing import List, Optional
from datetime import datetime

from ..models.position import Position
from ..models.strategy import Strategy
from ..strategy.base import StrategyExecutor
from ..utils.helpers import generate_id
from .execution import OrderExecutor
from .costs import CostCalculator


class PositionGenerator:
    """Generate trading positions based on strategy signals."""

    def __init__(
        self,
        initial_capital: float,
        strategy: Strategy,
        commission_rate: float = 0.001,
        slippage_rate: float = 0.001
    ):
        """
        Initialize position generator.

        Args:
            initial_capital: Starting capital
            strategy: Trading strategy
            commission_rate: Commission rate (default: 0.1%)
            slippage_rate: Slippage rate (default: 0.1%)
        """
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.strategy = strategy
        self.strategy_executor = StrategyExecutor(strategy)

        cost_calculator = CostCalculator(commission_rate, slippage_rate)
        self.order_executor = OrderExecutor(cost_calculator)

        self.positions: List[Position] = []
        self.current_position: Optional[Position] = None

    def generate_positions(self, df: pd.DataFrame) -> List[Position]:
        """
        Generate positions from OHLCV data and strategy.

        Args:
            df: DataFrame with OHLCV data

        Returns:
            List of Position objects
        """
        # Generate signals
        df_with_signals = self.strategy_executor.generate_signals(df)

        # Execute trades based on signals
        for idx in range(len(df_with_signals)):
            row = df_with_signals.iloc[idx]
            signal = row['signal']
            timestamp = row['timestamp']
            price = row['close']

            # Process signal
            if signal == 1 and self.current_position is None:
                # Buy signal and not in position - open position
                self._open_position(timestamp, price)
            elif signal == -1 and self.current_position is not None:
                # Sell signal and in position - close position
                self._close_position(timestamp, price)
            elif signal == 0 and self.current_position is not None:
                # No signal but in position - could add exit logic here
                # For now, we hold the position
                pass

        # Close any remaining open position at last price
        if self.current_position is not None:
            last_row = df_with_signals.iloc[-1]
            self._close_position(last_row['timestamp'], last_row['close'])

        return self.positions

    def _open_position(self, timestamp: datetime, price: float):
        """
        Open a new long position.

        Args:
            timestamp: Entry timestamp
            price: Entry price
        """
        # Calculate position size
        quantity = self.order_executor.calculate_position_size(
            self.current_capital,
            price,
            risk_pct=100  # Use 100% of capital for now
        )

        if quantity == 0:
            return  # Not enough capital

        # Execute order
        execution = self.order_executor.execute_market_order(
            signal=1,
            price=price,
            timestamp=timestamp,
            quantity=quantity,
            position_type="long"
        )

        # Create position
        position = Position(
            id=generate_id("pos"),
            timestamp=timestamp,
            type="long",
            entry_price=execution["price"],
            quantity=quantity,
            exit_price=None,
            pnl=None
        )

        self.current_position = position

        # Deduct capital used (including commission)
        cost = (execution["price"] * quantity) + execution["commission"]
        self.current_capital -= cost

    def _close_position(self, timestamp: datetime, price: float):
        """
        Close the current position.

        Args:
            timestamp: Exit timestamp
            price: Exit price
        """
        if self.current_position is None:
            return

        # Execute exit order
        execution = self.order_executor.execute_market_order(
            signal=-1,
            price=price,
            timestamp=timestamp,
            quantity=self.current_position.quantity,
            position_type="long"
        )

        # Calculate P&L
        entry_value = self.current_position.entry_price * self.current_position.quantity
        exit_value = execution["price"] * self.current_position.quantity
        pnl = exit_value - entry_value - execution["commission"]

        # Update position
        self.current_position.exit_price = execution["price"]
        self.current_position.pnl = pnl

        # Add to completed positions
        self.positions.append(self.current_position)

        # Return capital
        self.current_capital += exit_value - execution["commission"]

        # Clear current position
        self.current_position = None

    def get_final_capital(self) -> float:
        """Get final capital after all trades."""
        return self.current_capital

    def get_equity_curve(self) -> List[tuple]:
        """
        Get equity curve as list of (timestamp, equity) tuples.

        Returns:
            List of (datetime, float) tuples
        """
        equity_curve = []
        running_capital = self.initial_capital

        for position in self.positions:
            if position.pnl is not None:
                running_capital += position.pnl
                equity_curve.append((position.timestamp, running_capital))

        return equity_curve

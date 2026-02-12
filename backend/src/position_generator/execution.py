from datetime import datetime
from typing import Literal

from .costs import CostCalculator


class OrderExecutor:
    """Execute trading orders with slippage and costs."""

    def __init__(self, cost_calculator: CostCalculator = None):
        self.cost_calculator = cost_calculator or CostCalculator()

    def execute_market_order(
        self,
        signal: int,
        price: float,
        timestamp: datetime,
        quantity: float,
        position_type: Literal["long", "short"] = "long"
    ) -> dict:
        """
        Execute a market order.

        Args:
            signal: 1 for buy, -1 for sell, 0 for hold
            price: Market price
            timestamp: Execution timestamp
            quantity: Number of shares
            position_type: Type of position

        Returns:
            Dict with execution details
        """
        if signal == 0:
            return None

        is_long = position_type == "long"

        # Adjust price for slippage
        if signal == 1:  # Buy/Entry
            executed_price = self.cost_calculator.adjust_entry_price(price, is_long)
        else:  # Sell/Exit
            executed_price = self.cost_calculator.adjust_exit_price(price, is_long)

        # Calculate commission
        commission = self.cost_calculator.calculate_commission(quantity, executed_price)

        return {
            "price": executed_price,
            "timestamp": timestamp,
            "quantity": quantity,
            "commission": commission,
            "type": position_type
        }

    def calculate_position_size(
        self,
        capital: float,
        price: float,
        risk_pct: float = 1.0
    ) -> float:
        """
        Calculate position size based on available capital.

        Args:
            capital: Available capital
            price: Entry price
            risk_pct: Percentage of capital to risk (default: 100%)

        Returns:
            Number of shares to buy
        """
        max_value = capital * (risk_pct / 100)
        quantity = max_value / price

        # Round down to avoid exceeding capital
        return int(quantity)

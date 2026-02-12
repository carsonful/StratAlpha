class CostCalculator:
    """Calculate trading costs and commissions."""

    def __init__(self, commission_rate: float = 0.001, slippage_rate: float = 0.001):
        """
        Initialize cost calculator.

        Args:
            commission_rate: Commission rate per trade (default: 0.1%)
            slippage_rate: Slippage rate per trade (default: 0.1%)
        """
        self.commission_rate = commission_rate
        self.slippage_rate = slippage_rate

    def calculate_commission(self, quantity: float, price: float) -> float:
        """
        Calculate commission for a trade.

        Args:
            quantity: Number of shares
            price: Price per share

        Returns:
            Commission amount
        """
        trade_value = quantity * price
        return trade_value * self.commission_rate

    def calculate_slippage(self, quantity: float, price: float) -> float:
        """
        Calculate slippage cost for a trade.

        Args:
            quantity: Number of shares
            price: Price per share

        Returns:
            Slippage cost
        """
        trade_value = quantity * price
        return trade_value * self.slippage_rate

    def calculate_total_costs(self, quantity: float, price: float) -> float:
        """
        Calculate total trading costs (commission + slippage).

        Args:
            quantity: Number of shares
            price: Price per share

        Returns:
            Total cost
        """
        commission = self.calculate_commission(quantity, price)
        slippage = self.calculate_slippage(quantity, price)
        return commission + slippage

    def adjust_entry_price(self, price: float, is_long: bool = True) -> float:
        """
        Adjust entry price for slippage.

        Args:
            price: Original price
            is_long: True for long position, False for short

        Returns:
            Adjusted price
        """
        if is_long:
            # For long, we pay more (slippage against us)
            return price * (1 + self.slippage_rate)
        else:
            # For short, we receive less
            return price * (1 - self.slippage_rate)

    def adjust_exit_price(self, price: float, is_long: bool = True) -> float:
        """
        Adjust exit price for slippage.

        Args:
            price: Original price
            is_long: True for long position, False for short

        Returns:
            Adjusted price
        """
        if is_long:
            # For long exit, we receive less
            return price * (1 - self.slippage_rate)
        else:
            # For short exit, we pay more
            return price * (1 + self.slippage_rate)

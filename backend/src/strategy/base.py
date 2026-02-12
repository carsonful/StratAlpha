import pandas as pd
import numpy as np
from typing import List

from ..models.strategy import Strategy, Condition
from .parser import StrategyParser


class StrategyExecutor:
    """Execute trading strategy and generate signals."""

    def __init__(self, strategy: Strategy):
        self.strategy = strategy
        self.parser = StrategyParser(strategy)

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate buy/sell signals based on strategy.

        Args:
            df: DataFrame with OHLCV data

        Returns:
            DataFrame with indicators and 'signal' column
            Signal values: 1 (buy), -1 (sell), 0 (hold)
        """
        # Calculate all indicators
        df_with_indicators = self.parser.calculate_all_indicators(df)

        # Evaluate conditions for each row
        signals = []
        for idx in range(len(df_with_indicators)):
            signal = self._evaluate_conditions_at_index(df_with_indicators, idx)
            signals.append(signal)

        df_with_indicators['signal'] = signals

        return df_with_indicators

    def _evaluate_conditions_at_index(self, df: pd.DataFrame, index: int) -> int:
        """
        Evaluate all conditions at a specific index.

        Args:
            df: DataFrame with calculated indicators
            index: Row index to evaluate

        Returns:
            Signal: 1 (buy), -1 (sell), 0 (hold)
        """
        # Check if we have enough data (all indicators valid)
        row = df.iloc[index]

        # Check for NaN values in required indicators
        for indicator in self.strategy.indicators:
            if pd.isna(row.get(indicator.name)):
                return 0  # Not enough data yet

        # Evaluate all conditions (AND logic)
        all_conditions_met = True

        for condition in self.strategy.conditions:
            if not self._evaluate_single_condition(condition, df, index):
                all_conditions_met = False
                break

        # For now, simple logic: all conditions met = buy signal
        # TODO: Can be extended to support sell conditions separately
        if all_conditions_met:
            return 1  # Buy signal
        else:
            return 0  # Hold

    def _evaluate_single_condition(self, condition: Condition, df: pd.DataFrame, index: int) -> bool:
        """
        Evaluate a single condition.

        Args:
            condition: Condition to evaluate
            df: DataFrame with indicators
            index: Row index

        Returns:
            True if condition is met, False otherwise
        """
        # Get indicator value
        indicator_value = self.parser.resolve_value(condition.indicator, df, index)

        # Get comparison value
        compare_value = self.parser.resolve_value(condition.value, df, index)

        # Perform comparison based on operator
        if condition.operator == "gt":
            return indicator_value > compare_value
        elif condition.operator == "gte":
            return indicator_value >= compare_value
        elif condition.operator == "lt":
            return indicator_value < compare_value
        elif condition.operator == "lte":
            return indicator_value <= compare_value
        elif condition.operator == "eq":
            return np.isclose(indicator_value, compare_value)
        else:
            raise ValueError(f"Unknown operator: {condition.operator}")

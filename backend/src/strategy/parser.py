from typing import Dict, Callable, Any
import pandas as pd

from ..models.strategy import Strategy, Indicator
from ..data import indicators as ind_module


class StrategyParser:
    """Parse and prepare strategy for execution."""

    def __init__(self, strategy: Strategy):
        self.strategy = strategy
        self.indicator_calculators: Dict[str, Callable] = {}
        self._parse_indicators()

    def _parse_indicators(self):
        """Parse indicator definitions into callable functions."""
        for indicator in self.strategy.indicators:
            # Create a callable that will add the indicator column to DataFrame
            self.indicator_calculators[indicator.name] = self._create_indicator_calculator(indicator)

    def _create_indicator_calculator(self, indicator: Indicator) -> Callable:
        """
        Create a function that calculates an indicator.

        Args:
            indicator: Indicator definition

        Returns:
            Callable that takes DataFrame and returns calculated values
        """
        def calculator(df: pd.DataFrame) -> pd.Series | pd.DataFrame:
            return ind_module.calculate(indicator.type, df, **indicator.parameters)

        return calculator

    def calculate_all_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate all indicators and add them as columns to DataFrame.

        Args:
            df: DataFrame with OHLCV data

        Returns:
            DataFrame with indicator columns added
        """
        result_df = df.copy()

        for ind_name, calculator in self.indicator_calculators.items():
            calculated = calculator(result_df)

            # Handle both Series and DataFrame returns
            if isinstance(calculated, pd.Series):
                result_df[ind_name] = calculated
            elif isinstance(calculated, pd.DataFrame):
                # For indicators that return multiple columns (like MACD, Bollinger)
                for col in calculated.columns:
                    result_df[f"{ind_name}_{col}"] = calculated[col]

        return result_df

    def get_indicator_column_name(self, indicator_name: str) -> str:
        """
        Get the DataFrame column name for an indicator.

        Args:
            indicator_name: Name of the indicator

        Returns:
            Column name in DataFrame
        """
        # For simple indicators, it's just the name
        # For complex indicators (MACD, Bollinger), might need adjustment
        return indicator_name

    def resolve_value(self, value: float | str, df: pd.DataFrame, index: int) -> float:
        """
        Resolve a value that might be a number or indicator reference.

        Args:
            value: Either a float or indicator name
            df: DataFrame with calculated indicators
            index: Row index to get value from

        Returns:
            Resolved float value
        """
        if isinstance(value, str):
            # It's an indicator reference
            if value in df.columns:
                return float(df.loc[index, value])
            else:
                raise ValueError(f"Indicator '{value}' not found in calculated data")
        else:
            return float(value)

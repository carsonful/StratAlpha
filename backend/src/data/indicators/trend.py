import pandas as pd
import numpy as np


def calculate_sma(df: pd.DataFrame, period: int = 20, column: str = 'close') -> pd.Series:
    """
    Calculate Simple Moving Average.

    Args:
        df: DataFrame with price data
        period: Number of periods for moving average
        column: Column to calculate SMA on (default: 'close')

    Returns:
        Series with SMA values
    """
    return df[column].rolling(window=period, min_periods=period).mean()


def calculate_ema(df: pd.DataFrame, period: int = 20, column: str = 'close') -> pd.Series:
    """
    Calculate Exponential Moving Average.

    Args:
        df: DataFrame with price data
        period: Number of periods for EMA
        column: Column to calculate EMA on (default: 'close')

    Returns:
        Series with EMA values
    """
    return df[column].ewm(span=period, adjust=False, min_periods=period).mean()


def calculate_macd(
    df: pd.DataFrame,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
    column: str = 'close'
) -> pd.DataFrame:
    """
    Calculate MACD (Moving Average Convergence Divergence).

    Args:
        df: DataFrame with price data
        fast: Fast EMA period
        slow: Slow EMA period
        signal: Signal line period
        column: Column to calculate MACD on (default: 'close')

    Returns:
        DataFrame with 'macd', 'signal', and 'histogram' columns
    """
    fast_ema = df[column].ewm(span=fast, adjust=False).mean()
    slow_ema = df[column].ewm(span=slow, adjust=False).mean()

    macd_line = fast_ema - slow_ema
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    return pd.DataFrame({
        'macd': macd_line,
        'signal': signal_line,
        'histogram': histogram
    })

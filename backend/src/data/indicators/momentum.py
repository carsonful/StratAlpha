import pandas as pd
import numpy as np


def calculate_rsi(df: pd.DataFrame, period: int = 14, column: str = 'close') -> pd.Series:
    """
    Calculate Relative Strength Index (RSI).

    Args:
        df: DataFrame with price data
        period: Number of periods for RSI calculation
        column: Column to calculate RSI on (default: 'close')

    Returns:
        Series with RSI values (0-100)
    """
    delta = df[column].diff()

    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return rsi


def calculate_stochastic(
    df: pd.DataFrame,
    period: int = 14,
    smooth_k: int = 3,
    smooth_d: int = 3
) -> pd.DataFrame:
    """
    Calculate Stochastic Oscillator.

    Args:
        df: DataFrame with price data (must have 'high', 'low', 'close')
        period: Lookback period
        smooth_k: %K smoothing period
        smooth_d: %D smoothing period

    Returns:
        DataFrame with '%K' and '%D' columns
    """
    low_min = df['low'].rolling(window=period, min_periods=period).min()
    high_max = df['high'].rolling(window=period, min_periods=period).max()

    k = 100 * (df['close'] - low_min) / (high_max - low_min)
    k_smooth = k.rolling(window=smooth_k).mean()
    d = k_smooth.rolling(window=smooth_d).mean()

    return pd.DataFrame({
        '%K': k_smooth,
        '%D': d
    })


def calculate_roc(df: pd.DataFrame, period: int = 10, column: str = 'close') -> pd.Series:
    """
    Calculate Rate of Change (ROC).

    Args:
        df: DataFrame with price data
        period: Number of periods for ROC calculation
        column: Column to calculate ROC on (default: 'close')

    Returns:
        Series with ROC values
    """
    roc = ((df[column] - df[column].shift(period)) / df[column].shift(period)) * 100
    return roc

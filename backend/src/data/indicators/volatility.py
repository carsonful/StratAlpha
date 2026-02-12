import pandas as pd
import numpy as np


def calculate_bollinger_bands(
    df: pd.DataFrame,
    period: int = 20,
    std: float = 2.0,
    column: str = 'close'
) -> pd.DataFrame:
    """
    Calculate Bollinger Bands.

    Args:
        df: DataFrame with price data
        period: Number of periods for moving average
        std: Number of standard deviations for bands
        column: Column to calculate on (default: 'close')

    Returns:
        DataFrame with 'upper', 'middle', 'lower' columns
    """
    middle = df[column].rolling(window=period, min_periods=period).mean()
    rolling_std = df[column].rolling(window=period, min_periods=period).std()

    upper = middle + (rolling_std * std)
    lower = middle - (rolling_std * std)

    return pd.DataFrame({
        'upper': upper,
        'middle': middle,
        'lower': lower
    })


def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Calculate Average True Range (ATR).

    Args:
        df: DataFrame with OHLC data
        period: Number of periods for ATR calculation

    Returns:
        Series with ATR values
    """
    high_low = df['high'] - df['low']
    high_close = np.abs(df['high'] - df['close'].shift())
    low_close = np.abs(df['low'] - df['close'].shift())

    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    atr = true_range.rolling(window=period, min_periods=period).mean()

    return atr

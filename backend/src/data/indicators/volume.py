import pandas as pd
import numpy as np


def calculate_obv(df: pd.DataFrame) -> pd.Series:
    """
    Calculate On-Balance Volume (OBV).

    Args:
        df: DataFrame with 'close' and 'volume' columns

    Returns:
        Series with OBV values
    """
    obv = pd.Series(index=df.index, dtype=float)
    obv.iloc[0] = df['volume'].iloc[0]

    for i in range(1, len(df)):
        if df['close'].iloc[i] > df['close'].iloc[i - 1]:
            obv.iloc[i] = obv.iloc[i - 1] + df['volume'].iloc[i]
        elif df['close'].iloc[i] < df['close'].iloc[i - 1]:
            obv.iloc[i] = obv.iloc[i - 1] - df['volume'].iloc[i]
        else:
            obv.iloc[i] = obv.iloc[i - 1]

    return obv


def calculate_vwap(df: pd.DataFrame) -> pd.Series:
    """
    Calculate Volume Weighted Average Price (VWAP).

    Args:
        df: DataFrame with 'high', 'low', 'close', 'volume' columns

    Returns:
        Series with VWAP values
    """
    typical_price = (df['high'] + df['low'] + df['close']) / 3
    vwap = (typical_price * df['volume']).cumsum() / df['volume'].cumsum()

    return vwap

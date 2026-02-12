import pandas as pd
from typing import List
from datetime import datetime

from ..models.data import OHLCVData


def dataframe_to_ohlcv(df: pd.DataFrame) -> List[OHLCVData]:
    """Convert pandas DataFrame to list of OHLCVData objects."""
    ohlcv_list = []

    for _, row in df.iterrows():
        ohlcv = OHLCVData(
            timestamp=row['timestamp'] if isinstance(row['timestamp'], datetime) else pd.to_datetime(row['timestamp']),
            open=float(row['open']),
            high=float(row['high']),
            low=float(row['low']),
            close=float(row['close']),
            volume=float(row['volume'])
        )
        ohlcv_list.append(ohlcv)

    return ohlcv_list


def ohlcv_to_dataframe(ohlcv_list: List[OHLCVData]) -> pd.DataFrame:
    """Convert list of OHLCVData objects to pandas DataFrame."""
    data = [{
        'timestamp': o.timestamp,
        'open': o.open,
        'high': o.high,
        'low': o.low,
        'close': o.close,
        'volume': o.volume
    } for o in ohlcv_list]

    df = pd.DataFrame(data)
    if len(df) > 0:
        df = df.sort_values('timestamp').reset_index(drop=True)

    return df


def resample_timeframe(df: pd.DataFrame, interval: str) -> pd.DataFrame:
    """
    Resample data to different timeframe.

    Args:
        df: DataFrame with OHLCV data
        interval: Target interval (e.g., '1H', '4H', '1D', '1W')

    Returns:
        Resampled DataFrame
    """
    if df.empty:
        return df

    df_copy = df.copy()
    df_copy.set_index('timestamp', inplace=True)

    resampled = df_copy.resample(interval).agg({
        'open': 'first',
        'high': 'max',
        'low': 'min',
        'close': 'last',
        'volume': 'sum'
    }).dropna()

    return resampled.reset_index()


def align_timestamps(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure timestamps are in datetime format and sorted."""
    df_copy = df.copy()

    if 'timestamp' in df_copy.columns:
        df_copy['timestamp'] = pd.to_datetime(df_copy['timestamp'])
        df_copy = df_copy.sort_values('timestamp').reset_index(drop=True)

    return df_copy


def fill_missing_data(df: pd.DataFrame, method: str = 'ffill') -> pd.DataFrame:
    """
    Fill missing data in DataFrame.

    Args:
        df: DataFrame with potential missing values
        method: Fill method ('ffill', 'bfill', or 'interpolate')

    Returns:
        DataFrame with filled values
    """
    df_copy = df.copy()

    if method == 'ffill':
        df_copy = df_copy.fillna(method='ffill')
    elif method == 'bfill':
        df_copy = df_copy.fillna(method='bfill')
    elif method == 'interpolate':
        numeric_cols = df_copy.select_dtypes(include=['float64', 'int64']).columns
        df_copy[numeric_cols] = df_copy[numeric_cols].interpolate(method='linear')

    return df_copy

import pandas as pd
import numpy as np


def validate_ohlc_integrity(df: pd.DataFrame) -> tuple[bool, list[str]]:
    """
    Validate OHLC data integrity.

    Args:
        df: DataFrame with OHLC data

    Returns:
        Tuple of (is_valid, list of error messages)
    """
    errors = []

    # Check required columns
    required_cols = ['open', 'high', 'low', 'close', 'volume']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {', '.join(missing_cols)}")
        return False, errors

    # Check high >= low
    invalid_high_low = df['high'] < df['low']
    if invalid_high_low.any():
        count = invalid_high_low.sum()
        errors.append(f"Found {count} rows where high < low")

    # Check high >= open, close
    invalid_high_open = df['high'] < df['open']
    invalid_high_close = df['high'] < df['close']
    if invalid_high_open.any() or invalid_high_close.any():
        errors.append("Found rows where high < open or high < close")

    # Check low <= open, close
    invalid_low_open = df['low'] > df['open']
    invalid_low_close = df['low'] > df['close']
    if invalid_low_open.any() or invalid_low_close.any():
        errors.append("Found rows where low > open or low > close")

    # Check for negative prices
    price_cols = ['open', 'high', 'low', 'close']
    for col in price_cols:
        if (df[col] <= 0).any():
            errors.append(f"Found negative or zero values in {col}")

    # Check for negative volume
    if (df['volume'] < 0).any():
        errors.append("Found negative volume values")

    return len(errors) == 0, errors


def remove_outliers(df: pd.DataFrame, column: str = 'close', std_threshold: float = 5.0) -> pd.DataFrame:
    """
    Remove outliers using standard deviation method.

    Args:
        df: DataFrame with price data
        column: Column to check for outliers
        std_threshold: Number of standard deviations for outlier detection

    Returns:
        DataFrame with outliers removed
    """
    if column not in df.columns:
        return df

    mean = df[column].mean()
    std = df[column].std()

    lower_bound = mean - (std_threshold * std)
    upper_bound = mean + (std_threshold * std)

    # Filter rows within bounds
    filtered_df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

    return filtered_df.reset_index(drop=True)


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


def detect_splits(df: pd.DataFrame, threshold: float = 0.5) -> list[dict]:
    """
    Detect potential stock splits.

    Args:
        df: DataFrame with OHLC data
        threshold: Price change threshold to flag as potential split (default: 50%)

    Returns:
        List of dictionaries with split information
    """
    if 'close' not in df.columns or 'timestamp' not in df.columns:
        return []

    df_sorted = df.sort_values('timestamp').copy()
    price_changes = df_sorted['close'].pct_change()

    # Find large negative price changes (potential splits)
    potential_splits = []
    for idx in price_changes[price_changes < -threshold].index:
        if idx > 0:
            potential_splits.append({
                'timestamp': df_sorted.loc[idx, 'timestamp'],
                'price_before': df_sorted.loc[idx - 1, 'close'],
                'price_after': df_sorted.loc[idx, 'close'],
                'change_pct': price_changes.loc[idx] * 100
            })

    return potential_splits

from typing import Callable, Dict, Any
import pandas as pd

from .trend import calculate_sma, calculate_ema, calculate_macd
from .momentum import calculate_rsi, calculate_stochastic, calculate_roc
from .volatility import calculate_bollinger_bands, calculate_atr
from .volume import calculate_obv, calculate_vwap


# Indicator registry mapping names to calculation functions
INDICATORS: Dict[str, Callable] = {
    'sma': calculate_sma,
    'ema': calculate_ema,
    'macd': calculate_macd,
    'rsi': calculate_rsi,
    'stochastic': calculate_stochastic,
    'roc': calculate_roc,
    'bollinger': calculate_bollinger_bands,
    'atr': calculate_atr,
    'obv': calculate_obv,
    'vwap': calculate_vwap,
}


def calculate(name: str, df: pd.DataFrame, **params) -> pd.Series | pd.DataFrame:
    """
    Calculate indicator by name with parameters.

    Args:
        name: Indicator name (e.g., 'sma', 'rsi')
        df: DataFrame with price data
        **params: Indicator-specific parameters

    Returns:
        Series or DataFrame with indicator values

    Raises:
        ValueError: If indicator name is not recognized
    """
    if name not in INDICATORS:
        raise ValueError(f"Unknown indicator: {name}. Available: {list(INDICATORS.keys())}")

    indicator_func = INDICATORS[name]
    return indicator_func(df, **params)


def get_available_indicators() -> list[str]:
    """Get list of available indicator names."""
    return list(INDICATORS.keys())


def register_indicator(name: str, func: Callable):
    """
    Register a custom indicator function.

    Args:
        name: Name to register the indicator under
        func: Calculation function that takes DataFrame and returns Series/DataFrame
    """
    INDICATORS[name] = func


__all__ = [
    'INDICATORS',
    'calculate',
    'get_available_indicators',
    'register_indicator',
    'calculate_sma',
    'calculate_ema',
    'calculate_macd',
    'calculate_rsi',
    'calculate_stochastic',
    'calculate_roc',
    'calculate_bollinger_bands',
    'calculate_atr',
    'calculate_obv',
    'calculate_vwap',
]

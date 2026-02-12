from fastapi import APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from ...models.strategy import Strategy, StrategyValidationResponse
from ...strategy.validator import validate_strategy
from ...data.indicators import get_available_indicators

router = APIRouter()


@router.post("/validate", response_model=StrategyValidationResponse)
async def validate_strategy_endpoint(strategy: Strategy):
    """
    Validate a trading strategy definition.
    """
    try:
        errors = validate_strategy(strategy)

        return StrategyValidationResponse(
            valid=len(errors) == 0,
            errors=errors
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating strategy: {str(e)}")


@router.get("/indicators")
async def get_indicators():
    """
    Get list of available technical indicators.
    """
    indicators = get_available_indicators()

    indicator_info = {
        "sma": {"name": "Simple Moving Average", "parameters": ["period"]},
        "ema": {"name": "Exponential Moving Average", "parameters": ["period"]},
        "rsi": {"name": "Relative Strength Index", "parameters": ["period"]},
        "macd": {"name": "MACD", "parameters": ["fast", "slow", "signal"]},
        "bollinger": {"name": "Bollinger Bands", "parameters": ["period", "std"]},
        "atr": {"name": "Average True Range", "parameters": ["period"]},
        "stochastic": {"name": "Stochastic Oscillator", "parameters": ["period", "smooth_k", "smooth_d"]},
        "roc": {"name": "Rate of Change", "parameters": ["period"]},
        "obv": {"name": "On-Balance Volume", "parameters": []},
        "vwap": {"name": "Volume Weighted Average Price", "parameters": []},
    }

    return {
        "indicators": [
            {
                "type": ind_type,
                "name": info["name"],
                "parameters": info["parameters"]
            }
            for ind_type, info in indicator_info.items()
            if ind_type in indicators
        ]
    }

from fastapi import APIRouter, HTTPException
from typing import List

from ...models.analysis import EquityCurveResponse
from ...models.position import Position
from ...analysis.metrics import MetricsCalculator

router = APIRouter()


@router.post("/equity-curve", response_model=EquityCurveResponse)
async def get_equity_curve(positions: List[Position], initial_capital: float = 10000.0):
    """
    Generate equity curve from positions.
    """
    try:
        metrics_calc = MetricsCalculator()
        curve = metrics_calc.generate_equity_curve(positions, initial_capital)

        return EquityCurveResponse(curve=curve)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating equity curve: {str(e)}")


@router.post("/drawdown-periods")
async def get_drawdown_periods(positions: List[Position], initial_capital: float = 10000.0):
    """
    Identify significant drawdown periods.
    """
    try:
        metrics_calc = MetricsCalculator()
        curve = metrics_calc.generate_equity_curve(positions, initial_capital)

        # Find periods where drawdown > 5%
        significant_drawdowns = [
            {
                "timestamp": point.timestamp,
                "equity": point.equity,
                "drawdown": point.drawdown
            }
            for point in curve
            if point.drawdown < -5.0
        ]

        return {
            "drawdown_periods": significant_drawdowns,
            "count": len(significant_drawdowns)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing drawdowns: {str(e)}")

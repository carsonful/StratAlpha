from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.analysis import BacktestRequest, BacktestResult
from ...data.warehouse import DataWarehouse
from ...strategy.validator import validate_strategy
from ...position_generator.generator import PositionGenerator
from ...analysis.metrics import MetricsCalculator
from ...utils.helpers import get_db

router = APIRouter()


@router.post("/run", response_model=BacktestResult)
async def run_backtest(
    request: BacktestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute a complete backtest.

    Process:
    1. Validate strategy
    2. Fetch OHLCV data
    3. Generate trading signals
    4. Execute positions
    5. Calculate performance metrics

    Returns complete backtest results.
    """
    try:
        # Step 1: Validate strategy
        validation_errors = validate_strategy(request.strategy)
        if validation_errors:
            error_messages = [e.message for e in validation_errors]
            raise HTTPException(
                status_code=400,
                detail=f"Strategy validation failed: {', '.join(error_messages)}"
            )

        # Step 2: Fetch OHLCV data
        warehouse = DataWarehouse(db)
        df = await warehouse.get_ohlcv_data(
            request.symbol,
            request.start_date,
            request.end_date
        )

        if df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data available for {request.symbol} in date range"
            )

        # Ensure we have enough data for indicators
        if len(df) < 50:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data: only {len(df)} rows. Need at least 50 for reliable backtesting."
            )

        await warehouse.close()

        # Step 3-4: Generate positions (includes signal generation and execution)
        position_generator = PositionGenerator(
            initial_capital=request.initial_capital,
            strategy=request.strategy
        )

        positions = position_generator.generate_positions(df)

        if not positions:
            raise HTTPException(
                status_code=400,
                detail="No trades generated. Strategy may not have triggered any signals in this date range."
            )

        # Step 5: Calculate metrics
        metrics_calc = MetricsCalculator()

        total_return = metrics_calc.calculate_total_return(positions, request.initial_capital)

        equity_curve = position_generator.get_equity_curve()
        sharpe_ratio = metrics_calc.calculate_sharpe_ratio(equity_curve)
        max_drawdown = metrics_calc.calculate_max_drawdown(equity_curve)
        win_rate = metrics_calc.calculate_win_rate(positions)

        # Additional metrics
        performance_metrics = metrics_calc.calculate_performance_metrics(positions)

        final_capital = position_generator.get_final_capital()

        # Return results
        return BacktestResult(
            total_return=total_return,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=max_drawdown,
            win_rate=win_rate,
            positions=positions,
            metrics=performance_metrics,
            final_capital=final_capital
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest execution error: {str(e)}")


@router.get("/status/{backtest_id}")
async def get_backtest_status(backtest_id: str):
    """
    Get status of a running backtest (placeholder for async execution).
    """
    # For now, all backtests run synchronously
    # This endpoint is for future async implementation
    return {
        "backtest_id": backtest_id,
        "status": "completed",
        "message": "Backtests currently run synchronously"
    }

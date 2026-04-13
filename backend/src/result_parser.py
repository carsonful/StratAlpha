"""
Parse LEAN backtest output files into the frontend's BacktestRun shape.
Handles both successful and failed backtests.
"""
from __future__ import annotations
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


def parse_results(result_paths: Dict[str, Optional[Path]], config: Dict[str, Any]) -> Dict[str, Any]:
    summary_path = result_paths.get("summary")
    order_events_path = result_paths.get("order_events")

    if not summary_path or not summary_path.exists():
        return _failed_run(config, "No backtest summary file found")

    try:
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        return _failed_run(config, f"Failed to read summary: {e}")

    state = summary.get("state", {})
    status_str = state.get("Status", "")

    if status_str == "RuntimeError" or state.get("RuntimeError"):
        error_msg = state.get("RuntimeError", "Unknown runtime error")
        stack = state.get("StackTrace", "")
        full_msg = error_msg
        if stack:
            full_msg += f"\n\n{stack[:1000]}"
        return _failed_run(config, full_msg)

    statistics = summary.get("statistics", {})
    perf = summary.get("totalPerformance", {})
    portfolio_stats = perf.get("portfolioStatistics", {})
    algo_config = summary.get("algorithmConfiguration", {})

    equity_curve = _parse_equity_curve(summary)
    trade_log = _parse_trade_log(perf, order_events_path)

    start_date = algo_config.get("startDate", config.get("startDate", ""))
    end_date = algo_config.get("endDate", config.get("endDate", ""))
    if start_date and "T" in start_date:
        start_date = start_date.split("T")[0]
    if end_date and "T" in end_date:
        end_date = end_date.split("T")[0]

    start_equity = _safe_float(portfolio_stats.get("startEquity", 0))
    end_equity = _safe_float(portfolio_stats.get("endEquity", 0))
    if start_equity == 0:
        start_equity = config.get("initialCash", 100000)

    return {
        "id": str(uuid.uuid4())[:8],
        "strategy": "Blockly Strategy",
        "symbol": config.get("symbol", ""),
        "period": config.get("resolution", "daily"),
        "startDate": start_date,
        "endDate": end_date,
        "initialCapital": config.get("initialCash", 100000),
        "commission": _parse_dollar(statistics.get("Total Fees", "$0")),
        "totalReturn": statistics.get("Net Profit", "0%"),
        "sharpe": _parse_float(statistics.get("Sharpe Ratio", "0")),
        "sortino": _parse_float(statistics.get("Sortino Ratio", "0")),
        "maxDrawdown": statistics.get("Drawdown", "0%"),
        "winRate": statistics.get("Win Rate", "0%"),
        "trades": int(_parse_float(statistics.get("Total Orders", "0"))),
        "avgDuration": perf.get("tradeStatistics", {}).get("averageTradeDuration", "N/A"),
        "annualReturn": statistics.get("Compounding Annual Return", "0%"),
        "alpha": _safe_float(portfolio_stats.get("alpha", 0)),
        "beta": _safe_float(portfolio_stats.get("beta", 0)),
        "startEquity": start_equity,
        "endEquity": end_equity,
        "status": "complete",
        "equityCurve": equity_curve,
        "tradeLog": trade_log,
    }


def _failed_run(config: Dict[str, Any], error_message: str) -> Dict[str, Any]:
    return {
        "id": str(uuid.uuid4())[:8],
        "strategy": "Blockly Strategy",
        "symbol": config.get("symbol", ""),
        "period": config.get("resolution", "daily"),
        "startDate": config.get("startDate", ""),
        "endDate": config.get("endDate", ""),
        "initialCapital": config.get("initialCash", 100000),
        "commission": 0,
        "totalReturn": "0%",
        "sharpe": 0,
        "sortino": 0,
        "maxDrawdown": "0%",
        "winRate": "0%",
        "trades": 0,
        "avgDuration": "N/A",
        "annualReturn": "0%",
        "alpha": 0,
        "beta": 0,
        "startEquity": config.get("initialCash", 100000),
        "endEquity": config.get("initialCash", 100000),
        "status": "failed",
        "errorMessage": error_message,
        "equityCurve": [],
        "tradeLog": [],
    }


def _parse_equity_curve(summary: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract equity curve from the Strategy Equity chart."""
    try:
        charts = summary.get("charts", {})
        equity_chart = charts.get("Strategy Equity", {})
        series = equity_chart.get("series", {})
        equity_series = series.get("Equity", {})
        values = equity_series.get("values", [])
    except (AttributeError, TypeError):
        return []

    points = []
    peak = 0.0
    for entry in values:
        if not isinstance(entry, list) or len(entry) < 5:
            continue
        timestamp = entry[0]
        close_val = entry[4]
        try:
            dt = datetime.utcfromtimestamp(timestamp)
            date_str = dt.strftime("%Y-%m-%d")
            value = float(close_val)
        except (ValueError, TypeError, OSError):
            continue

        peak = max(peak, value)
        drawdown = ((value - peak) / peak * 100) if peak > 0 else 0

        points.append({
            "date": date_str,
            "value": round(value, 2),
            "drawdown": round(drawdown, 2),
        })

    return points


def _parse_trade_log(perf: Dict[str, Any], order_events_path: Optional[Path]) -> List[Dict[str, Any]]:
    """Build trade log from closedTrades and/or order events."""
    trades = []

    closed = perf.get("closedTrades", [])
    if closed:
        for i, t in enumerate(closed):
            entry_price = float(t.get("entryPrice", 0))
            exit_price = float(t.get("exitPrice", 0))
            quantity = abs(float(t.get("quantity", 1)))
            pnl = float(t.get("profitLoss", 0))
            cost_basis = entry_price * quantity if entry_price and quantity else 1
            pnl_pct = (pnl / cost_basis * 100) if cost_basis > 0 else 0

            trades.append({
                "tradeId": str(i + 1),
                "entryDate": _safe_date(t.get("entryTime", "")),
                "exitDate": _safe_date(t.get("exitTime", "")),
                "side": "Long" if t.get("direction", 0) == 0 else "Short",
                "entryPrice": entry_price,
                "exitPrice": exit_price,
                "pnl": pnl,
                "pnlPct": f"{pnl_pct:+.2f}%",
            })
        return trades

    if order_events_path and order_events_path.exists():
        try:
            events = json.loads(order_events_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return trades

        fills = [e for e in events if e.get("status") == "filled"]
        for i, fill in enumerate(fills):
            ts = fill.get("time", 0)
            try:
                dt = datetime.utcfromtimestamp(ts)
                date_str = dt.strftime("%Y-%m-%d %H:%M")
            except (ValueError, TypeError, OSError):
                date_str = "N/A"

            trades.append({
                "tradeId": str(i + 1),
                "entryDate": date_str,
                "exitDate": "",
                "side": "Long" if fill.get("direction") == "buy" else "Short",
                "entryPrice": float(fill.get("fillPrice", 0)),
                "exitPrice": 0,
                "pnl": 0,
                "pnlPct": "N/A",
            })

    return trades


def _parse_float(s: str) -> float:
    try:
        cleaned = s.replace("%", "").replace(",", "").replace("$", "").strip()
        return float(cleaned)
    except (ValueError, AttributeError):
        return 0.0


def _parse_dollar(s: str) -> float:
    try:
        cleaned = s.replace("$", "").replace(",", "").strip()
        return abs(float(cleaned))
    except (ValueError, AttributeError):
        return 0.0


def _safe_float(val: Any) -> float:
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _safe_date(val: Any) -> str:
    if isinstance(val, str) and val:
        if "T" in val:
            return val.split("T")[0]
        return val
    if isinstance(val, (int, float)):
        try:
            return datetime.utcfromtimestamp(val).strftime("%Y-%m-%d %H:%M")
        except (ValueError, OSError):
            pass
    return "N/A"

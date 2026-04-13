"""
Translate a validated Blockly workspace JSON into a LEAN QCAlgorithm Python file.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional


RESOLUTION_MAP = {
    "minute": "Resolution.MINUTE",
    "5minute": "Resolution.MINUTE",
    "15minute": "Resolution.MINUTE",
    "30minute": "Resolution.MINUTE",
    "hourly": "Resolution.HOUR",
    "daily": "Resolution.DAILY",
}

RESOLUTION_PERIOD_MAP = {
    "5minute": 5,
    "15minute": 15,
    "30minute": 30,
}

COMPARE_OP_MAP = {
    "GT": ">", "LT": "<", "GTE": ">=", "LTE": "<=", "EQ": "==",
}

ARITHMETIC_OP_MAP = {
    "ADD": "+", "MINUS": "-", "MULTIPLY": "*", "DIVIDE": "/", "POWER": "**",
}

SOURCE_MAP = {
    "CLOSE": "close", "OPEN": "open", "HIGH": "high", "LOW": "low", "VOLUME": "volume",
}


class TranslationContext:
    """Accumulates state while walking the block tree."""

    def __init__(self, symbol: str, resolution: str) -> None:
        self.symbol = symbol
        self.resolution = resolution
        self.lean_resolution = RESOLUTION_MAP.get(resolution, "Resolution.DAILY")
        self.indicators: List[str] = []
        self.indicator_vars: Dict[str, str] = {}
        self.prev_vars: Dict[str, str] = {}
        self.prev_update_lines: List[str] = []
        self.init_lines: List[str] = []
        self.on_data_lines: List[str] = []
        self.exit_check_lines: List[str] = []
        self._indicator_counter = 0
        self._cross_counter = 0
        self._order_counter = 0

    def add_indicator(self, init_code: str, var_name: str) -> str:
        if init_code in self.indicator_vars:
            return self.indicator_vars[init_code]
        self._indicator_counter += 1
        actual_var = f"self._ind_{self._indicator_counter}"
        self.indicator_vars[init_code] = actual_var
        self.init_lines.append(f"        {actual_var} = {init_code}")
        return actual_var

    def add_prev_tracking(self, expr: str) -> str:
        if expr in self.prev_vars:
            return self.prev_vars[expr]
        self._cross_counter += 1
        prev_var = f"self._prev_{self._cross_counter}"
        self.prev_vars[expr] = prev_var
        self.init_lines.append(f"        {prev_var} = None")
        self.prev_update_lines.append(f"        {prev_var} = {expr}")
        return prev_var

    def next_order_id(self) -> int:
        self._order_counter += 1
        return self._order_counter


def translate(workspace: Dict[str, Any], config: Dict[str, Any]) -> str:
    top_blocks = workspace.get("blocks", {}).get("blocks", [])
    root = next(b for b in top_blocks if b.get("type") == "strategy_root")

    symbol = (root.get("fields") or {}).get("SYMBOL", "SPY").strip().upper()
    resolution = config.get("resolution", "daily")
    start_date = config.get("startDate", "2020-01-01")
    end_date = config.get("endDate", "2024-12-31")
    initial_cash = config.get("initialCash", 100000)

    ctx = TranslationContext(symbol, resolution)

    strategy_block = (root.get("inputs") or {}).get("STRATEGY", {}).get("block")
    if strategy_block:
        _translate_statement_chain(strategy_block, ctx, indent=2)

    return _assemble_algorithm(ctx, symbol, resolution, start_date, end_date, initial_cash)


def _assemble_algorithm(ctx: TranslationContext, symbol: str, resolution: str,
                        start_date: str, end_date: str, initial_cash: float) -> str:
    sy, sm, sd = start_date.split("-")
    ey, em, ed = end_date.split("-")

    consolidator_setup = ""
    if resolution in RESOLUTION_PERIOD_MAP:
        period = RESOLUTION_PERIOD_MAP[resolution]
        consolidator_setup = f"""
        self._consolidator = TradeBarConsolidator(timedelta(minutes={period}))
        self._consolidator.data_consolidated += self._on_consolidated
        self.subscription_manager.add_consolidator(self.symbol, self._consolidator)
"""

    lines = [
        "from AlgorithmImports import *",
        "",
        "",
        "class BlocklyStrategy(QCAlgorithm):",
        "",
        "    def initialize(self):",
        f"        self.set_start_date({int(sy)}, {int(sm)}, {int(sd)})",
        f"        self.set_end_date({int(ey)}, {int(em)}, {int(ed)})",
        f"        self.set_cash({int(initial_cash)})",
        f'        self.symbol = self.add_equity("{symbol}", {ctx.lean_resolution}).symbol',
        f"        self._bar_count = 0",
    ]

    if consolidator_setup:
        lines.append(consolidator_setup)

    for line in ctx.init_lines:
        lines.append(line)

    lines.append("")
    lines.append("    def on_data(self, data: Slice):")
    lines.append("        if not data.contains_key(self.symbol):")
    lines.append("            return")
    lines.append("        self._bar_count += 1")

    if ctx.exit_check_lines:
        lines.append("")
        for line in ctx.exit_check_lines:
            lines.append(line)

    if ctx.on_data_lines:
        lines.append("")
        for line in ctx.on_data_lines:
            lines.append(line)
    elif not ctx.exit_check_lines:
        lines.append("        pass")

    if ctx.prev_update_lines:
        lines.append("")
        for line in ctx.prev_update_lines:
            lines.append(line)

    lines.append("")
    return "\n".join(lines)


def _translate_statement_chain(block: Dict[str, Any], ctx: TranslationContext, indent: int) -> None:
    current: Optional[Dict[str, Any]] = block
    while current:
        _translate_statement(current, ctx, indent)
        current = (current.get("next") or {}).get("block")


def _translate_statement(block: Dict[str, Any], ctx: TranslationContext, indent: int) -> None:
    btype = block.get("type", "")
    pad = "    " * indent

    if btype == "when":
        cond_block = (block.get("inputs") or {}).get("CONDITION", {}).get("block")
        do_block = (block.get("inputs") or {}).get("DO", {}).get("block")

        cond_expr = _translate_value(cond_block, ctx) if cond_block else "True"
        ctx.on_data_lines.append(f"{pad}if {cond_expr}:")

        if do_block:
            _translate_statement_chain(do_block, ctx, indent + 1)
        else:
            ctx.on_data_lines.append(f"{pad}    pass")

    elif btype == "order":
        _translate_order(block, ctx, indent)

    elif btype == "liquidate":
        ctx.on_data_lines.append(f"{pad}self.liquidate(self.symbol)")


def _translate_order(block: Dict[str, Any], ctx: TranslationContext, indent: int) -> None:
    pad = "    " * indent
    fields = block.get("fields") or {}
    extra = block.get("extraState") or {}
    inputs = block.get("inputs") or {}

    oid = ctx.next_order_id()

    direction = fields.get("DIRECTION", "BUY")
    order_type = extra.get("orderType", fields.get("ORDER_TYPE", "MARKET"))
    size_mode = fields.get("SIZE_MODE", "QTY")
    size_val = fields.get("SIZE", 100)

    sign = 1 if direction == "BUY" else -1

    if size_mode == "QTY":
        qty_expr = f"{sign * abs(int(size_val))}"
    elif size_mode == "USD":
        qty_expr = f"int({sign} * {abs(float(size_val))} / self.securities[self.symbol].price)"
    else:  # PCT
        qty_expr = f"int({sign} * self.portfolio.total_portfolio_value * {abs(float(size_val)) / 100} / self.securities[self.symbol].price)"

    has_exit_after = extra.get("exitAfter", False)
    has_sl = extra.get("sl", False)
    has_tp = extra.get("tp", False)
    has_exit_when = extra.get("exitWhen", False)
    has_any_exit = has_exit_after or has_sl or has_tp or has_exit_when

    if has_any_exit:
        entry_bar_var = f"self._entry_bar_{oid}"
        entry_price_var = f"self._entry_price_{oid}"
        ctx.init_lines.append(f"        {entry_bar_var} = -1")
        ctx.init_lines.append(f"        {entry_price_var} = 0.0")

    if order_type == "MARKET":
        ctx.on_data_lines.append(f"{pad}self.market_order(self.symbol, {qty_expr})")
    elif order_type == "LIMIT":
        price_block = inputs.get("LIMIT_PRICE", {}).get("block")
        price_expr = _translate_value(price_block, ctx) if price_block else "self.securities[self.symbol].price"
        ctx.on_data_lines.append(f"{pad}self.limit_order(self.symbol, {qty_expr}, {price_expr})")
    elif order_type == "STOP":
        price_block = inputs.get("STOP_PRICE", {}).get("block")
        price_expr = _translate_value(price_block, ctx) if price_block else "self.securities[self.symbol].price"
        ctx.on_data_lines.append(f"{pad}self.stop_market_order(self.symbol, {qty_expr}, {price_expr})")

    if has_any_exit:
        ctx.on_data_lines.append(f"{pad}{entry_bar_var} = self._bar_count")
        ctx.on_data_lines.append(f"{pad}{entry_price_var} = self.securities[self.symbol].price")

    if not has_any_exit:
        return

    epad = "    " * 2
    ctx.exit_check_lines.append(f"{epad}if self.portfolio[self.symbol].invested and {entry_bar_var} > 0:")

    exit_conditions: List[str] = []

    if has_exit_after:
        bars = int(fields.get("EXIT_AFTER_BARS", 10))
        exit_conditions.append(f"self._bar_count - {entry_bar_var} >= {bars}")

    if has_sl:
        sl_mode = extra.get("slMode", fields.get("SL_MODE", "PCT"))
        if sl_mode == "PCT":
            sl_pct = float(fields.get("SL_PCT", 5))
            if direction == "BUY":
                exit_conditions.append(
                    f"self.securities[self.symbol].price <= {entry_price_var} * {1 - sl_pct / 100}"
                )
            else:
                exit_conditions.append(
                    f"self.securities[self.symbol].price >= {entry_price_var} * {1 + sl_pct / 100}"
                )
        elif sl_mode == "ATR":
            atr_mult = float(fields.get("SL_ATR_MULT", 1.5))
            atr_period = int(fields.get("SL_ATR_PERIOD", 14))
            atr_var = ctx.add_indicator(
                f"self.atr(self.symbol, {atr_period}, resolution={ctx.lean_resolution})",
                f"atr_sl_{atr_period}",
            )
            atr_val = f"({atr_var}.current.value if {atr_var}.is_ready else 0)"
            if direction == "BUY":
                exit_conditions.append(
                    f"self.securities[self.symbol].price <= {entry_price_var} - {atr_mult} * {atr_val}"
                )
            else:
                exit_conditions.append(
                    f"self.securities[self.symbol].price >= {entry_price_var} + {atr_mult} * {atr_val}"
                )

    if has_tp:
        tp_mode = extra.get("tpMode", fields.get("TP_MODE", "PCT"))
        if tp_mode == "PCT":
            tp_pct = float(fields.get("TP_PCT", 10))
            if direction == "BUY":
                exit_conditions.append(
                    f"self.securities[self.symbol].price >= {entry_price_var} * {1 + tp_pct / 100}"
                )
            else:
                exit_conditions.append(
                    f"self.securities[self.symbol].price <= {entry_price_var} * {1 - tp_pct / 100}"
                )
        elif tp_mode == "ATR":
            atr_mult = float(fields.get("TP_ATR_MULT", 2.0))
            atr_period = int(fields.get("TP_ATR_PERIOD", 14))
            atr_var = ctx.add_indicator(
                f"self.atr(self.symbol, {atr_period}, resolution={ctx.lean_resolution})",
                f"atr_tp_{atr_period}",
            )
            atr_val = f"({atr_var}.current.value if {atr_var}.is_ready else 0)"
            if direction == "BUY":
                exit_conditions.append(
                    f"self.securities[self.symbol].price >= {entry_price_var} + {atr_mult} * {atr_val}"
                )
            else:
                exit_conditions.append(
                    f"self.securities[self.symbol].price <= {entry_price_var} - {atr_mult} * {atr_val}"
                )

    if has_exit_when:
        cond_block = inputs.get("EXIT_WHEN_CONFIG", {}).get("block")
        if cond_block:
            cond_expr = _translate_value(cond_block, ctx)
            exit_conditions.append(cond_expr)

    if exit_conditions:
        combined = " or ".join(exit_conditions)
        ctx.exit_check_lines.append(f"{epad}    if {combined}:")
        ctx.exit_check_lines.append(f"{epad}        self.liquidate(self.symbol)")
        ctx.exit_check_lines.append(f"{epad}        {entry_bar_var} = -1")


def _translate_value(block: Optional[Dict[str, Any]], ctx: TranslationContext) -> str:
    if not block:
        return "0"

    btype = block.get("type", "")
    fields = block.get("fields") or {}
    inputs = block.get("inputs") or {}

    if btype == "math_number":
        return str(fields.get("NUM", 0))

    if btype == "math_arithmetic":
        left = _translate_value(inputs.get("A", {}).get("block"), ctx)
        right = _translate_value(inputs.get("B", {}).get("block"), ctx)
        op = ARITHMETIC_OP_MAP.get(fields.get("OP", "ADD"), "+")
        return f"({left} {op} {right})"

    if btype == "compare":
        left = _translate_value(inputs.get("LEFT", {}).get("block"), ctx)
        right = _translate_value(inputs.get("RIGHT", {}).get("block"), ctx)
        op = COMPARE_OP_MAP.get(fields.get("OP", "GT"), ">")
        return f"({left} {op} {right})"

    if btype == "crosses":
        a_block = inputs.get("A", {}).get("block")
        b_block = inputs.get("B", {}).get("block")
        a_expr = _translate_value(a_block, ctx)
        b_expr = _translate_value(b_block, ctx)
        direction = fields.get("DIR", "ABOVE")
        prev_a = ctx.add_prev_tracking(a_expr)
        prev_b = ctx.add_prev_tracking(b_expr)
        if direction == "ABOVE":
            return f"({prev_a} is not None and {prev_a} <= {prev_b} and {a_expr} > {b_expr})"
        else:
            return f"({prev_a} is not None and {prev_a} >= {prev_b} and {a_expr} < {b_expr})"

    if btype == "logic_and":
        a = _translate_value(inputs.get("A", {}).get("block"), ctx)
        b = _translate_value(inputs.get("B", {}).get("block"), ctx)
        return f"({a} and {b})"

    if btype == "logic_or":
        a = _translate_value(inputs.get("A", {}).get("block"), ctx)
        b = _translate_value(inputs.get("B", {}).get("block"), ctx)
        return f"({a} or {b})"

    if btype == "logic_not":
        a = _translate_value(inputs.get("A", {}).get("block"), ctx)
        return f"(not {a})"

    if btype == "data_price":
        source = SOURCE_MAP.get(fields.get("SOURCE", "CLOSE"), "close")
        offset = int(fields.get("OFFSET", 0))
        if offset == 0:
            if source == "close":
                return "self.securities[self.symbol].price"
            return f"data[self.symbol].{source}"
        hist_var = ctx.add_indicator(
            f'self.history(self.symbol, {offset + 1}, {ctx.lean_resolution})["{source}"]',
            f"hist_{source}_{offset}",
        )
        return f"{hist_var}.iloc[-{offset + 1}] if len({hist_var}) > {offset} else 0"

    if btype.startswith("ind_"):
        return _translate_indicator(block, ctx)

    if btype == "pos_is_invested":
        return "self.portfolio[self.symbol].invested"

    if btype == "pos_quantity":
        return "self.portfolio[self.symbol].quantity"

    if btype == "pos_avg_price":
        return "self.portfolio[self.symbol].average_price"

    if btype == "portfolio_cash":
        return "self.portfolio.cash"

    if btype == "portfolio_equity":
        return "self.portfolio.total_portfolio_value"

    return "0"


def _translate_indicator(block: Dict[str, Any], ctx: TranslationContext) -> str:
    btype = block.get("type", "")
    fields = block.get("fields") or {}
    period = int(fields.get("PERIOD", 14))
    offset = int(fields.get("OFFSET", 0))

    res_kwarg = f"resolution={ctx.lean_resolution}"

    if btype == "ind_sma":
        var = ctx.add_indicator(f"self.sma(self.symbol, {period}, {res_kwarg})", f"sma_{period}")
    elif btype == "ind_ema":
        var = ctx.add_indicator(f"self.ema(self.symbol, {period}, {res_kwarg})", f"ema_{period}")
    elif btype == "ind_rsi":
        var = ctx.add_indicator(f"self.rsi(self.symbol, {period}, {res_kwarg})", f"rsi_{period}")
    elif btype == "ind_atr":
        var = ctx.add_indicator(f"self.atr(self.symbol, {period}, {res_kwarg})", f"atr_{period}")
    elif btype in ("ind_boll_upper", "ind_boll_middle", "ind_boll_lower"):
        stddev = float(fields.get("STDDEV", 2))
        var = ctx.add_indicator(
            f"self.bb(self.symbol, {period}, {stddev}, {res_kwarg})",
            f"bb_{period}_{stddev}",
        )
        if btype == "ind_boll_upper":
            current = f"{var}.upper_band.current.value"
        elif btype == "ind_boll_lower":
            current = f"{var}.lower_band.current.value"
        else:
            current = f"{var}.middle_band.current.value"

        return f"({current} if {var}.is_ready else 0)"
    else:
        return "0"

    current = f"{var}.current.value"
    return f"({current} if {var}.is_ready else 0)"

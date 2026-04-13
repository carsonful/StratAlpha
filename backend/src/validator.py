"""
Validate a Blockly workspace JSON tree before attempting translation to LEAN code.
Returns (errors, warnings) where errors block execution and warnings are informational.
"""
from __future__ import annotations
from typing import Any, Dict, List, Tuple

MAX_DEPTH = 50

# Block types we know how to translate
KNOWN_TYPES = {
    "strategy_root", "when", "compare", "crosses",
    "logic_and", "logic_or", "logic_not",
    "data_price",
    "ind_sma", "ind_ema", "ind_rsi", "ind_atr",
    "ind_boll_upper", "ind_boll_middle", "ind_boll_lower",
    "order", "liquidate",
    "pos_is_invested", "pos_quantity", "pos_avg_price",
    "portfolio_cash", "portfolio_equity",
    "math_number", "math_arithmetic",
}


def validate_workspace(workspace: Dict[str, Any], config: Dict[str, Any] | None = None) -> Tuple[List[str], List[str]]:
    errors: List[str] = []
    warnings: List[str] = []

    top_blocks = workspace.get("blocks", {}).get("blocks", [])
    if not top_blocks:
        errors.append("Workspace is empty — add a Strategy root block to get started")
        return errors, warnings

    roots = [b for b in top_blocks if b.get("type") == "strategy_root"]
    non_roots = [b for b in top_blocks if b.get("type") != "strategy_root"]

    if len(roots) == 0:
        errors.append("Add a Strategy root block to define your symbol")
        return errors, warnings

    if len(roots) > 1:
        errors.append("Only one Strategy root block is allowed")
        return errors, warnings

    if non_roots:
        warnings.append("Some blocks are not connected to the Strategy root and will be ignored")

    root = roots[0]

    symbol = (root.get("fields") or {}).get("SYMBOL", "").strip()
    if not symbol:
        errors.append("Enter a ticker symbol in the Strategy root block")

    strategy_input = (root.get("inputs") or {}).get("STRATEGY", {}).get("block")
    if not strategy_input:
        errors.append("Your strategy is empty — add at least one When block inside the Strategy root")
        return errors, warnings

    has_order = _tree_has_block_type(strategy_input, {"order", "liquidate"})
    if not has_order:
        errors.append("Your strategy has no order or liquidate blocks — it will never trade")

    _validate_block(strategy_input, errors, warnings, depth=0)

    if config:
        _validate_config(config, errors)

    return errors, warnings


def _validate_config(config: Dict[str, Any], errors: List[str]) -> None:
    start = config.get("startDate", "")
    end = config.get("endDate", "")
    if start and end and start >= end:
        errors.append("Start date must be before end date")

    cash = config.get("initialCash", 100000)
    if cash is not None and cash <= 0:
        errors.append("Initial cash must be positive")


def _validate_block(block: Dict[str, Any], errors: List[str], warnings: List[str], depth: int) -> None:
    if not isinstance(block, dict) or depth > MAX_DEPTH:
        if depth > MAX_DEPTH:
            errors.append("Strategy is too deeply nested (possible circular reference)")
        return

    btype = block.get("type", "")

    if btype and btype not in KNOWN_TYPES:
        warnings.append(f"Unknown block type '{btype}' will be ignored")
        return

    if btype == "when":
        _check_value_input(block, "CONDITION", "A When block is missing its condition", errors)
        if not _has_input(block, "DO"):
            warnings.append("A When block has no actions inside it")

    elif btype == "compare":
        _check_value_input(block, "LEFT", "A comparison block has an empty left input", errors)
        _check_value_input(block, "RIGHT", "A comparison block has an empty right input", errors)

    elif btype == "crosses":
        _check_value_input(block, "A", "A crosses block has an empty first input", errors)
        _check_value_input(block, "B", "A crosses block has an empty second input", errors)

    elif btype == "logic_and":
        _check_value_input(block, "A", "An AND block has an empty first input", errors)
        _check_value_input(block, "B", "An AND block has an empty second input", errors)

    elif btype == "logic_or":
        _check_value_input(block, "A", "An OR block has an empty first input", errors)
        _check_value_input(block, "B", "An OR block has an empty second input", errors)

    elif btype == "logic_not":
        _check_value_input(block, "A", "A NOT block has an empty input", errors)

    elif btype == "order":
        _validate_order_block(block, errors)

    for inp_data in (block.get("inputs") or {}).values():
        child = inp_data.get("block")
        if child:
            _validate_block(child, errors, warnings, depth + 1)

    next_block = (block.get("next") or {}).get("block")
    if next_block:
        _validate_block(next_block, errors, warnings, depth + 1)


def _validate_order_block(block: Dict[str, Any], errors: List[str]) -> None:
    extra = block.get("extraState") or {}
    order_type = extra.get("orderType", "MARKET")

    if order_type == "LIMIT" and not _has_input(block, "LIMIT_PRICE"):
        errors.append("A limit order is missing its limit price")
    if order_type == "STOP" and not _has_input(block, "STOP_PRICE"):
        errors.append("A stop order is missing its stop price")

    if extra.get("sl"):
        sl_mode = extra.get("slMode", "PCT")
        if sl_mode == "PRICE" and not _has_input(block, "SL_VALUE"):
            errors.append("Stop loss is set to price mode but has no price connected")

    if extra.get("tp"):
        tp_mode = extra.get("tpMode", "PCT")
        if tp_mode == "PRICE" and not _has_input(block, "TP_VALUE"):
            errors.append("Take profit is set to price mode but has no price connected")

    if extra.get("exitWhen") and not _has_input(block, "EXIT_WHEN_CONFIG"):
        errors.append("Exit-when is enabled but has no condition connected")


def _has_input(block: Dict[str, Any], name: str) -> bool:
    return bool((block.get("inputs") or {}).get(name, {}).get("block"))


def _check_value_input(block: Dict[str, Any], name: str, message: str, errors: List[str]) -> None:
    if not _has_input(block, name):
        errors.append(message)


def _tree_has_block_type(block: Dict[str, Any], types: set, depth: int = 0) -> bool:
    if not isinstance(block, dict) or depth > MAX_DEPTH:
        return False
    if block.get("type") in types:
        return True
    for inp_data in (block.get("inputs") or {}).values():
        child = inp_data.get("block")
        if child and _tree_has_block_type(child, types, depth + 1):
            return True
    next_block = (block.get("next") or {}).get("block")
    if next_block and _tree_has_block_type(next_block, types, depth + 1):
        return True
    return False

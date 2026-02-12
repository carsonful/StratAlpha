from typing import List
from ..models.strategy import Strategy, StrategyValidationError
from ..data.indicators import get_available_indicators


def validate_strategy(strategy: Strategy) -> List[StrategyValidationError]:
    """
    Validate strategy definition.

    Args:
        strategy: Strategy object to validate

    Returns:
        List of validation errors (empty if valid)
    """
    errors = []
    available_indicators = get_available_indicators()
    indicator_names = set()

    # Validate indicators
    for indicator in strategy.indicators:
        # Check if indicator type is supported
        if indicator.type not in available_indicators:
            errors.append(StrategyValidationError(
                field=f"indicators.{indicator.id}.type",
                message=f"Unknown indicator type '{indicator.type}'. Available: {', '.join(available_indicators)}"
            ))

        # Check for duplicate indicator names
        if indicator.name in indicator_names:
            errors.append(StrategyValidationError(
                field=f"indicators.{indicator.id}.name",
                message=f"Duplicate indicator name '{indicator.name}'"
            ))
        indicator_names.add(indicator.name)

        # Validate parameters
        param_errors = validate_indicator_parameters(indicator.type, indicator.parameters)
        errors.extend([
            StrategyValidationError(
                field=f"indicators.{indicator.id}.parameters",
                message=msg
            ) for msg in param_errors
        ])

    # Validate conditions
    for condition in strategy.conditions:
        # Check if referenced indicator exists
        indicator_ref = condition.indicator

        # Could be a number or an indicator name
        if isinstance(condition.value, str):
            # Check if value references an indicator
            if condition.value not in indicator_names:
                errors.append(StrategyValidationError(
                    field=f"conditions.{condition.id}.value",
                    message=f"Indicator reference '{condition.value}' not found in indicators"
                ))

        # Check if indicator being compared exists
        if indicator_ref not in indicator_names:
            errors.append(StrategyValidationError(
                field=f"conditions.{condition.id}.indicator",
                message=f"Indicator reference '{indicator_ref}' not found in indicators"
            ))

    # Ensure at least one indicator and one condition
    if len(strategy.indicators) == 0:
        errors.append(StrategyValidationError(
            field="indicators",
            message="Strategy must have at least one indicator"
        ))

    if len(strategy.conditions) == 0:
        errors.append(StrategyValidationError(
            field="conditions",
            message="Strategy must have at least one condition"
        ))

    return errors


def validate_indicator_parameters(indicator_type: str, parameters: dict) -> List[str]:
    """
    Validate indicator-specific parameters.

    Args:
        indicator_type: Type of indicator
        parameters: Parameter dictionary

    Returns:
        List of error messages
    """
    errors = []

    # Common validations
    if 'period' in parameters:
        period = parameters['period']
        if not isinstance(period, int) or period < 1:
            errors.append(f"'period' must be a positive integer, got {period}")

    # Indicator-specific validations
    if indicator_type == 'macd':
        for param in ['fast', 'slow', 'signal']:
            if param in parameters:
                value = parameters[param]
                if not isinstance(value, int) or value < 1:
                    errors.append(f"'{param}' must be a positive integer, got {value}")

    elif indicator_type == 'bollinger':
        if 'std' in parameters:
            std = parameters['std']
            if not isinstance(std, (int, float)) or std <= 0:
                errors.append(f"'std' must be a positive number, got {std}")

    elif indicator_type == 'stochastic':
        for param in ['smooth_k', 'smooth_d']:
            if param in parameters:
                value = parameters[param]
                if not isinstance(value, int) or value < 1:
                    errors.append(f"'{param}' must be a positive integer, got {value}")

    return errors

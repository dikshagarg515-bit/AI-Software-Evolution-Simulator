CHANGE_TYPE_WEIGHTS = {
    "modify_function": 0,
    "add_function": 0,
    "remove_function": 1,
    "change_dependency": 2,
    "change_api": 3,
}


CHANGE_TYPE_DESCRIPTIONS = {
    "modify_function": "An existing function is modified.",
    "add_function": "A new function is added to the component.",
    "remove_function": "An existing function is removed.",
    "change_dependency": "A dependency relationship is changed.",
    "change_api": "An interface or API used by other components is changed.",
}


def simulate_change(
    target_file: str,
    impact_result: dict,
    dependency_metrics: dict[str, dict],
    change_type: str = "modify_function",
) -> dict:
    if change_type not in CHANGE_TYPE_WEIGHTS:
        raise ValueError(
            f"Invalid change type: {change_type}"
        )

    metrics = dependency_metrics.get(
        target_file,
        {
            "hotspot_score": 0,
            "hotspot_level": "Low",
            "dependencies": 0,
            "dependents": 0,
            "total_connections": 0,
        },
    )

    impact_count = impact_result["impact_count"]
    hotspot_score = metrics["hotspot_score"]

    change_weight = CHANGE_TYPE_WEIGHTS[change_type]

    risk_score = (
        impact_count
        + hotspot_score
        + change_weight
    )

    if risk_score >= 7:
        risk_level = "High"
    elif risk_score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    if risk_level == "High":
        risk_explanation = (
            f"This {change_type.replace('_', ' ')} is considered high risk "
            f"because the target component affects {impact_count} other "
            f"files and has a hotspot score of {hotspot_score}. "
            f"The selected change type adds {change_weight} additional "
            f"risk points."
        )

    elif risk_level == "Medium":
        risk_explanation = (
            f"This {change_type.replace('_', ' ')} has moderate risk "
            f"because the target component affects {impact_count} other "
            f"files and has a hotspot score of {hotspot_score}. "
            f"The selected change type adds {change_weight} additional "
            f"risk points."
        )

    else:
        risk_explanation = (
            f"This {change_type.replace('_', ' ')} has low structural risk "
            f"because the target component has limited dependency impact."
        )

    return {
        "target_file": target_file,
        "change_type": change_type,
        "change_description": CHANGE_TYPE_DESCRIPTIONS[change_type],
        "impact_count": impact_count,
        "hotspot_score": hotspot_score,
        "change_weight": change_weight,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_explanation": risk_explanation,
        "direct_dependents": impact_result["direct_dependents"],
        "all_affected_files": impact_result["all_affected_files"],
    }
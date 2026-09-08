def simulate_change(
    target_file: str,
    impact_result: dict,
    dependency_metrics: dict[str, dict],
) -> dict:
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

    risk_score = impact_count + hotspot_score

    if risk_score >= 7:
        risk_level = "High"
    elif risk_score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "target_file": target_file,
        "impact_count": impact_count,
        "hotspot_score": hotspot_score,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "direct_dependents": impact_result["direct_dependents"],
        "all_affected_files": impact_result["all_affected_files"],
    }
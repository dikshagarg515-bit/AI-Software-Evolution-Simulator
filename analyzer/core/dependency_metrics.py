def calculate_dependency_metrics(
    dependency_graph: dict[str, list[str]],
) -> dict[str, dict]:
    metrics = {}

    for file_path, dependencies in dependency_graph.items():
        metrics[file_path] = {
            "dependencies": len(dependencies),
            "dependents": 0,
        }

    for source, dependencies in dependency_graph.items():
        for dependency in dependencies:
            if dependency not in metrics:
                metrics[dependency] = {
                    "dependencies": 0,
                    "dependents": 0,
                }

            metrics[dependency]["dependents"] += 1

    for file_path, values in metrics.items():
        values["total_connections"] = (
            values["dependencies"]
            + values["dependents"]
        )

        values["hotspot_score"] = values["total_connections"]

        if values["hotspot_score"] >= 4:
            values["hotspot_level"] = "High"
        elif values["hotspot_score"] >= 2:
            values["hotspot_level"] = "Medium"
        else:
            values["hotspot_level"] = "Low"

    return metrics
def rank_architectural_hotspots(
    dependency_metrics: dict[str, dict],
) -> list[dict]:
    ranked = []

    for file_path, metrics in dependency_metrics.items():
        ranked.append(
            {
                "file": file_path,
                "hotspot_score": metrics["hotspot_score"],
                "hotspot_level": metrics["hotspot_level"],
                "dependencies": metrics["dependencies"],
                "dependents": metrics["dependents"],
                "total_connections": metrics["total_connections"],
            }
        )

    ranked.sort(
        key=lambda item: item["hotspot_score"],
        reverse=True,
    )

    return ranked
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

    return metrics
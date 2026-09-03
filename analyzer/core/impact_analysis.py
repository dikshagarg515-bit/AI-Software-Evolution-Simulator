from collections import deque


def build_reverse_graph(
    dependency_graph: dict[str, list[str]],
) -> dict[str, list[str]]:
    reverse_graph = {
        file_path: []
        for file_path in dependency_graph
    }

    for source, dependencies in dependency_graph.items():
        for dependency in dependencies:
            if dependency not in reverse_graph:
                reverse_graph[dependency] = []

            reverse_graph[dependency].append(source)

    for file_path in reverse_graph:
        reverse_graph[file_path] = sorted(
            set(reverse_graph[file_path])
        )

    return reverse_graph


def find_impact(
    dependency_graph: dict[str, list[str]],
    target_file: str,
) -> dict:
    reverse_graph = build_reverse_graph(dependency_graph)

    direct_dependents = reverse_graph.get(target_file, [])

    all_affected = set()
    queue = deque(direct_dependents)

    while queue:
        current_file = queue.popleft()

        if current_file in all_affected:
            continue

        all_affected.add(current_file)

        for dependent in reverse_graph.get(current_file, []):
            if dependent not in all_affected:
                queue.append(dependent)

    return {
        "target": target_file,
        "direct_dependents": direct_dependents,
        "all_affected_files": sorted(all_affected),
        "impact_count": len(all_affected),
    }
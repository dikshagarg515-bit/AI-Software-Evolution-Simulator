from pathlib import Path

from .models import RepositoryInfo


def module_name_from_path(file_path: str, repository_path: str) -> str:
    file = Path(file_path).resolve()
    root = Path(repository_path).resolve()

    relative_path = file.relative_to(root)
    without_suffix = relative_path.with_suffix("")

    parts = list(without_suffix.parts)

    if parts[-1] == "__init__":
        parts = parts[:-1]

    return ".".join(parts)


def resolve_import(
    imported_module: str,
    module_to_file: dict[str, str],
) -> str | None:
    # Exact match for imports such as:
    # analyzer.core.models
    if imported_module in module_to_file:
        return module_to_file[imported_module]

    # Match shorter imports such as:
    # models
    # against:
    # analyzer.core.models
    matches = [
        file_path
        for module_name, file_path in module_to_file.items()
        if module_name.endswith("." + imported_module)
    ]

    if len(matches) == 1:
        return matches[0]

    return None


def build_dependency_graph(repository: RepositoryInfo) -> dict[str, list[str]]:
    module_to_file = {}

    for file in repository.files:
        module_name = module_name_from_path(
            file.path,
            repository.path,
        )

        if module_name:
            module_to_file[module_name] = file.path

    graph = {}

    for file in repository.files:
        dependencies = []

        for imported_module in file.imports:
            target_file = resolve_import(
                imported_module,
                module_to_file,
            )

            if target_file and target_file != file.path:
                dependencies.append(target_file)

        graph[file.path] = sorted(set(dependencies))

    return graph
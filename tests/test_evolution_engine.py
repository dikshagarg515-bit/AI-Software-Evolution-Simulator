from analyzer.core.dependency_graph import build_dependency_graph
from analyzer.core.dependency_metrics import (
    calculate_dependency_metrics,
    rank_architectural_hotspots,
)
from analyzer.core.evolution_engine import simulate_change
from analyzer.core.impact_analysis import find_impact
from analyzer.core.models import FileInfo, RepositoryInfo


def create_test_repository():
    files = [
        FileInfo(
            path="project/main.py",
            language="Python",
            lines=20,
            functions=["main"],
            classes=[],
            imports=["core.models"],
        ),
        FileInfo(
            path="project/core/models.py",
            language="Python",
            lines=15,
            functions=["create_model"],
            classes=["Model"],
            imports=[],
        ),
        FileInfo(
            path="project/core/service.py",
            language="Python",
            lines=25,
            functions=["run_service"],
            classes=[],
            imports=["core.models"],
        ),
    ]

    return RepositoryInfo(
        path="project",
        total_files=3,
        files=files,
    )


def test_dependency_graph_builds_correctly():
    repository = create_test_repository()

    graph = build_dependency_graph(repository)

    assert "project/core/models.py" in graph["project/main.py"]
    assert "project/core/models.py" in graph["project/core/service.py"]


def test_dependency_metrics_calculate_dependents():
    repository = create_test_repository()

    graph = build_dependency_graph(repository)
    metrics = calculate_dependency_metrics(graph)

    model_metrics = metrics["project/core/models.py"]

    assert model_metrics["dependents"] == 2
    assert model_metrics["dependencies"] == 0
    assert model_metrics["total_connections"] == 2


def test_hotspot_ranking_places_most_connected_file_first():
    repository = create_test_repository()

    graph = build_dependency_graph(repository)
    metrics = calculate_dependency_metrics(graph)
    ranking = rank_architectural_hotspots(metrics)

    assert ranking[0]["file"] == "project/core/models.py"
    assert ranking[0]["hotspot_score"] == 2


def test_impact_analysis_finds_all_affected_files():
    repository = create_test_repository()

    graph = build_dependency_graph(repository)

    impact = find_impact(
        graph,
        "project/core/models.py",
    )

    assert impact["impact_count"] == 2
    assert "project/main.py" in impact["all_affected_files"]
    assert "project/core/service.py" in impact["all_affected_files"]


def test_high_risk_api_change_is_detected():
    repository = create_test_repository()

    graph = build_dependency_graph(repository)
    metrics = calculate_dependency_metrics(graph)

    impact = find_impact(
        graph,
        "project/core/models.py",
    )

    simulation = simulate_change(
        target_file="project/core/models.py",
        impact_result=impact,
        dependency_metrics=metrics,
        change_type="change_api",
    )

    assert simulation["risk_level"] == "High"
    assert simulation["risk_score"] == 7
    assert simulation["impact_count"] == 2
    assert simulation["hotspot_score"] == 2
def test_invalid_change_type_is_rejected():
    repository = create_test_repository()

    graph = build_dependency_graph(repository)
    metrics = calculate_dependency_metrics(graph)

    impact = find_impact(
        graph,
        "project/core/models.py",
    )

    try:
        simulate_change(
            target_file="project/core/models.py",
            impact_result=impact,
            dependency_metrics=metrics,
            change_type="invalid_change",
        )
        assert False, "Expected ValueError for invalid change type"
    except ValueError as error:
        assert str(error) == "Invalid change type: invalid_change"
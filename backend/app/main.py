from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analyzer.core.impact_analysis import find_impact
from analyzer.core.dependency_graph import build_dependency_graph
from analyzer.core.dependency_metrics import (
    calculate_dependency_metrics,
    rank_architectural_hotspots,
)
from analyzer.core.evolution_engine import simulate_change
from analyzer.core.repository_scanner import scan_repository
from backend.app.config import FRONTEND_URLS, PROJECT_NAME


app = FastAPI(title=PROJECT_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Software Evolution Simulator API is running!"
    }


@app.get("/analyze")
def analyze_repository(path: str):
    repository = scan_repository(path)
    dependency_graph = build_dependency_graph(repository)

    dependency_metrics = calculate_dependency_metrics(
        dependency_graph
    )
    hotspot_ranking = rank_architectural_hotspots(
    dependency_metrics
)

    result = repository.to_dict()
    result["dependency_graph"] = dependency_graph
    result["dependency_metrics"] = dependency_metrics
    result["hotspot_ranking"] = hotspot_ranking

    return result

@app.get("/impact")
def analyze_impact(path: str, file: str):
    repository = scan_repository(path)
    dependency_graph = build_dependency_graph(repository)

    target_file = (repository.path + "\\" + file).replace("/", "\\")

    impact = find_impact(
        dependency_graph,
        target_file,
    )

    return impact
@app.get("/simulate")
def simulate_repository_change(path: str, file: str):
    repository = scan_repository(path)
    dependency_graph = build_dependency_graph(repository)

    dependency_metrics = calculate_dependency_metrics(
        dependency_graph
    )

    target_file = (
        repository.path + "\\" + file
    ).replace("/", "\\")

    impact_result = find_impact(
        dependency_graph,
        target_file,
    )

    simulation = simulate_change(
        target_file,
        impact_result,
        dependency_metrics,
    )

    return simulation
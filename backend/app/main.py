from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analyzer.core.ai_reasoning import generate_ai_reasoning
from analyzer.core.dependency_graph import build_dependency_graph
from analyzer.core.dependency_metrics import (
    calculate_dependency_metrics,
    rank_architectural_hotspots,
)
from analyzer.core.evolution_engine import simulate_change
from analyzer.core.impact_analysis import find_impact
from analyzer.core.repository_scanner import scan_repository
from backend.app.auth import (
    get_current_user,
    router as auth_router,
)
from backend.app.config import FRONTEND_URLS, PROJECT_NAME
from backend.app.database import initialize_database


app = FastAPI(title=PROJECT_NAME)

initialize_database()

app.include_router(auth_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def validate_repository_path(path: str) -> Path:
    repository_path = Path(path)

    if not repository_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Repository path does not exist.",
        )

    if not repository_path.is_dir():
        raise HTTPException(
            status_code=400,
            detail="The provided path is not a directory.",
        )

    return repository_path


def analyze_repository_structure(path: str):
    validate_repository_path(path)

    repository = scan_repository(path)

    if repository.total_files == 0:
        raise HTTPException(
            status_code=400,
            detail="No supported Python files were found in the repository.",
        )

    dependency_graph = build_dependency_graph(repository)
    dependency_metrics = calculate_dependency_metrics(
        dependency_graph
    )

    return (
        repository,
        dependency_graph,
        dependency_metrics,
    )


def build_target_file(repository_path: str, file: str) -> str:
    return (
        repository_path + "\\" + file
    ).replace("/", "\\")


def validate_target_file(
    dependency_graph: dict[str, list[str]],
    repository_path: str,
    file: str,
) -> str:
    target_file = build_target_file(
        repository_path,
        file,
    )

    if target_file not in dependency_graph:
        raise HTTPException(
            status_code=404,
            detail="The requested file was not found in the repository.",
        )

    return target_file


@app.get("/")
def root():
    return {
        "message": "AI Software Evolution Simulator API is running!"
    }


@app.get("/analyze")
def analyze_repository(
    path: str,
    current_user=Depends(get_current_user),
):
    (
        repository,
        dependency_graph,
        dependency_metrics,
    ) = analyze_repository_structure(path)

    hotspot_ranking = rank_architectural_hotspots(
        dependency_metrics
    )

    result = repository.to_dict()
    result["dependency_graph"] = dependency_graph
    result["dependency_metrics"] = dependency_metrics
    result["hotspot_ranking"] = hotspot_ranking

    return result


@app.get("/impact")
def analyze_impact(
    path: str,
    file: str,
    current_user=Depends(get_current_user),
):
    (
        repository,
        dependency_graph,
        dependency_metrics,
    ) = analyze_repository_structure(path)

    target_file = validate_target_file(
        dependency_graph,
        repository.path,
        file,
    )

    return find_impact(
        dependency_graph,
        target_file,
    )


@app.get("/simulate")
def simulate_repository_change(
    path: str,
    file: str,
    change_type: str = "modify_function",
    current_user=Depends(get_current_user),
):
    allowed_change_types = {
        "modify_function",
        "add_function",
        "remove_function",
        "change_dependency",
        "change_api",
    }

    if change_type not in allowed_change_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid change type. "
                "Choose from: "
                + ", ".join(sorted(allowed_change_types))
            ),
        )

    (
        repository,
        dependency_graph,
        dependency_metrics,
    ) = analyze_repository_structure(path)

    target_file = validate_target_file(
        dependency_graph,
        repository.path,
        file,
    )

    impact_result = find_impact(
        dependency_graph,
        target_file,
    )

    simulation = simulate_change(
        target_file,
        impact_result,
        dependency_metrics,
        change_type,
    )

    simulation["ai_reasoning"] = generate_ai_reasoning(
        simulation
    )

    return simulation
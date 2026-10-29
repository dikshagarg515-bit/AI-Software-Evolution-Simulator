import pytest

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.auth import get_current_user


client = TestClient(app)


@pytest.fixture(autouse=True)
def override_authentication():
    app.dependency_overrides[get_current_user] = lambda: {
        "id": 1,
        "username": "test_user",
        "email": "test@example.com",
    }

    yield

    app.dependency_overrides.clear()


def test_analyze_rejects_nonexistent_repository():
    response = client.get(
        "/analyze",
        params={
            "path": r"C:\this\repository\does\not\exist",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Repository path does not exist."
    )


def test_analyze_rejects_file_instead_of_directory():
    response = client.get(
        "/analyze",
        params={
            "path": r"C:\Windows\notepad.exe",
        },
    )

    assert response.status_code in [400, 404]


def test_impact_rejects_nonexistent_repository():
    response = client.get(
        "/impact",
        params={
            "path": r"C:\this\repository\does\not\exist",
            "file": "main.py",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Repository path does not exist."
    )


def test_simulate_rejects_invalid_change_type():
    response = client.get(
        "/simulate",
        params={
            "path": (
                r"C:\Users\Diksha\Documents"
                r"\AI-Software-Evolution-Simulator"
            ),
            "file": "backend/app/main.py",
            "change_type": "invalid_change",
        },
    )

    assert response.status_code == 400
    assert "Invalid change type" in response.json()["detail"]
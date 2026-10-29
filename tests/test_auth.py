import sqlite3

from fastapi.testclient import TestClient

from backend.app import database
from backend.app.main import app


TEST_DATABASE_PATH = database.DATABASE_PATH.parent / "test_users.db"


def setup_test_database():
    connection = sqlite3.connect(TEST_DATABASE_PATH)

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


def clear_test_database():
    connection = sqlite3.connect(TEST_DATABASE_PATH)

    connection.execute("DELETE FROM users")

    connection.commit()
    connection.close()


setup_test_database()
clear_test_database()

original_database_path = database.DATABASE_PATH
database.DATABASE_PATH = TEST_DATABASE_PATH

client = TestClient(app)


def teardown_module():
    database.DATABASE_PATH = original_database_path

    if TEST_DATABASE_PATH.exists():
        TEST_DATABASE_PATH.unlink()


def test_register_new_user():
    response = client.post(
        "/auth/register",
        json={
            "username": "test_user_auth",
            "email": "test_auth@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Account created successfully."
    assert data["user"]["username"] == "test_user_auth"
    assert data["user"]["email"] == "test_auth@example.com"


def test_duplicate_email_is_rejected():
    response = client.post(
        "/auth/register",
        json={
            "username": "another_user",
            "email": "test_auth@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_with_correct_password():
    response = client.post(
        "/auth/login",
        json={
            "email": "test_auth@example.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_wrong_password():
    response = client.post(
        "/auth/login",
        json={
            "email": "test_auth@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401


def test_authenticated_user_can_access_me():
    login_response = client.post(
        "/auth/login",
        json={
            "email": "test_auth@example.com",
            "password": "TestPassword123!",
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "test_auth@example.com"
    assert data["username"] == "test_user_auth"


def test_me_requires_authentication():
    response = client.get("/auth/me")

    assert response.status_code == 401   
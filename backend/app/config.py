import os
from dotenv import load_dotenv

load_dotenv()

PROJECT_NAME = "AI Software Evolution Simulator"

FRONTEND_URLS = [
    "http://localhost:5173",
    "http://localhost:5174",
]

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "development-only-secret-key",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
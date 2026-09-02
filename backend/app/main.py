from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

    return repository.to_dict()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analyzer.core.repository_scanner import scan_repository


app = FastAPI(title="AI Software Evolution Simulator")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
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
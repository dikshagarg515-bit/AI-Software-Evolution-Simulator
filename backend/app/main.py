from fastapi import FastAPI

app = FastAPI(title="AI Software Evolution Simulator")


@app.get("/")
def root():
    return {
        "message": "AI Software Evolution Simulator API is running!"
    }
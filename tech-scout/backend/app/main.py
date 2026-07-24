from fastapi import FastAPI

app = FastAPI(
    title="Tech Scout API",
    version="1.0"
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "Tech Scout"
    }

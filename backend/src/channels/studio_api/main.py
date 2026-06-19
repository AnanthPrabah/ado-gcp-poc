"""Studio API — primary REST entry point for the photo-real-AI platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.observability.logging.logger import get_logger

log = get_logger(__name__)

app = FastAPI(
    title="Photo-Real AI — Studio API",
    version="0.1.0",
    description="REST API for photo-realistic AI image generation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"service": "photo-real-ai", "version": "0.1.0"}


def start():
    import uvicorn
    uvicorn.run("src.channels.studio_api.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    start()

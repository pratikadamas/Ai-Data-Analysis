"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, dataset, download, explore, upload
from app.config import settings

app = FastAPI(
    title="AI Data Analyst API",
    description="Upload structured data and analyze it with natural language.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(explore.router)
app.include_router(chat.router)
app.include_router(dataset.router)
app.include_router(download.router)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "env": settings.app_env}

"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, dataset, download, explore, upload, auth
from app.config import settings
from app.utils.auth import get_current_user

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

app.include_router(auth.router)
app.include_router(upload.router, dependencies=[Depends(get_current_user)])
app.include_router(explore.router, dependencies=[Depends(get_current_user)])
app.include_router(chat.router, dependencies=[Depends(get_current_user)])
app.include_router(dataset.router, dependencies=[Depends(get_current_user)])
app.include_router(download.router, dependencies=[Depends(get_current_user)])


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "env": settings.app_env}

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router

# Ensure all models are registered with Base
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup for simplicity in dev/testing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered project management platform API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Trackr API is operational", "version": "0.1.0"}


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "trackr-backend"}

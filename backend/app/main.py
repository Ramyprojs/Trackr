from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Trackr API",
    description="AI-powered project management platform API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Trackr API is operational", "version": "0.1.0"}


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "trackr-backend"}

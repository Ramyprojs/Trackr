from fastapi import APIRouter
from app.api.v1.endpoints import auth, workspaces, projects, tickets, sprints, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(sprints.router, prefix="/sprints", tags=["sprints"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

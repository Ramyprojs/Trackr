from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project, Board
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    BoardCreate,
    BoardResponse,
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=project_in.name,
        key=project_in.key.upper(),
        description=project_in.description,
        workspace_id=project_in.workspace_id,
    )
    db.add(project)
    await db.flush()

    # Automatically create a default board for the project
    board = Board(
        project_id=project.id,
        name="Main Board",
        description="Default kanban board",
    )
    db.add(board)
    await db.commit()

    res = await db.execute(
        select(Project)
        .options(selectinload(Project.boards))
        .where(Project.id == project.id)
    )
    return res.scalars().first()


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    workspace_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Project).options(selectinload(Project.boards))
    if workspace_id:
        query = query.where(Project.workspace_id == workspace_id)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.boards))
        .where(Project.id == project_id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return project

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.user import User
from app.models.ticket import Sprint
from app.schemas.ticket import SprintCreate, SprintUpdate, SprintResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
async def create_sprint(
    sprint_in: SprintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sprint = Sprint(
        project_id=sprint_in.project_id,
        name=sprint_in.name,
        goal=sprint_in.goal,
        start_date=sprint_in.start_date,
        end_date=sprint_in.end_date,
        status="planning",
    )
    db.add(sprint)
    await db.commit()
    await db.refresh(sprint)
    return sprint


@router.get("/", response_model=List[SprintResponse])
async def list_sprints(
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Sprint)
    if project_id:
        query = query.where(Sprint.project_id == project_id)
    query = query.order_by(Sprint.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{sprint_id}", response_model=SprintResponse)
async def get_sprint(
    sprint_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalars().first()
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found"
        )
    return sprint


@router.patch("/{sprint_id}", response_model=SprintResponse)
async def update_sprint(
    sprint_id: str,
    sprint_in: SprintUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = result.scalars().first()
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found"
        )

    update_data = sprint_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sprint, field, value)

    await db.commit()
    await db.refresh(sprint)
    return sprint

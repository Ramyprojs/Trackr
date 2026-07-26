from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project, Board
from app.models.ticket import Ticket, Comment
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    CommentCreate,
    CommentResponse,
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_in: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify project exists
    proj_res = await db.execute(
        select(Project).where(Project.id == ticket_in.project_id)
    )
    project = proj_res.scalars().first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Assign default board if not specified
    board_id = ticket_in.board_id
    if not board_id:
        board_res = await db.execute(
            select(Board).where(Board.project_id == project.id)
        )
        board = board_res.scalars().first()
        if board:
            board_id = board.id

    # Generate sequential ticket_key e.g. TRK-1, TRK-2
    count_res = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.project_id == project.id)
    )
    count = count_res.scalar() or 0
    ticket_key = f"{project.key}-{count + 1}"

    ticket = Ticket(
        project_id=project.id,
        board_id=board_id,
        sprint_id=ticket_in.sprint_id,
        ticket_key=ticket_key,
        title=ticket_in.title,
        description=ticket_in.description,
        status=ticket_in.status or "todo",
        priority=ticket_in.priority or "medium",
        labels=ticket_in.labels or [],
        estimate=ticket_in.estimate or 1,
        assignee_id=ticket_in.assignee_id,
        creator_id=current_user.id,
    )
    db.add(ticket)
    await db.commit()

    # Trigger background AI triage task if Celery is connected (handled in Phase 4)
    # import app.worker tasks here if available

    res = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.assignee), selectinload(Ticket.creator))
        .where(Ticket.id == ticket.id)
    )
    return res.scalars().first()


@router.get("/", response_model=List[TicketResponse])
async def list_tickets(
    project_id: Optional[str] = None,
    board_id: Optional[str] = None,
    sprint_id: Optional[str] = None,
    assignee_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Ticket).options(
        selectinload(Ticket.assignee), selectinload(Ticket.creator)
    )

    if project_id:
        query = query.where(Ticket.project_id == project_id)
    if board_id:
        query = query.where(Ticket.board_id == board_id)
    if sprint_id:
        query = query.where(Ticket.sprint_id == sprint_id)
    if assignee_id:
        query = query.where(Ticket.assignee_id == assignee_id)
    if status:
        query = query.where(Ticket.status == status)
    if priority:
        query = query.where(Ticket.priority == priority)

    query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.assignee), selectinload(Ticket.creator))
        .where(Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    return ticket


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_in: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    update_data = ticket_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)

    await db.commit()

    res = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.assignee), selectinload(Ticket.creator))
        .where(Ticket.id == ticket_id)
    )
    return res.scalars().first()


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    await db.delete(ticket)
    await db.commit()
    return None


# Comment Endpoints
@router.post("/{ticket_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    ticket_id: str,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t_res = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    if not t_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    comment = Comment(
        ticket_id=ticket_id,
        author_id=current_user.id,
        content=comment_in.content,
    )
    db.add(comment)
    await db.commit()

    res = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.id == comment.id)
    )
    return res.scalars().first()


@router.get("/{ticket_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.asc())
    )
    return result.scalars().all()

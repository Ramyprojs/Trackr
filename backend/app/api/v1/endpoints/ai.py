from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.user import User
from app.models.ticket import Ticket, Sprint, Comment
from app.api.deps import get_current_user
from app.ai.service import ai_service
from app.tasks import triage_ticket_task, summarize_ticket_comments_task, assess_sprint_risk_task

router = APIRouter()


@router.post("/triage/{ticket_id}")
async def trigger_ticket_triage(
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

    # Synchronous inline triage fallback + background task trigger
    triage_res = ai_service.triage_ticket(ticket.title, ticket.description or "")
    existing_labels = set(ticket.labels or [])
    ticket.labels = list(existing_labels.union(set(triage_res.get("labels", []))))
    ticket.priority = triage_res.get("priority", ticket.priority)
    ticket.estimate = triage_res.get("estimate", ticket.estimate)
    ticket.ai_triage_status = "completed"
    await db.commit()

    # Async task queue
    try:
        triage_ticket_task.delay(ticket_id)
    except Exception:
        pass

    return {
        "status": "success",
        "ticket_id": ticket_id,
        "suggested_triage": triage_res,
    }


@router.post("/summarize/{ticket_id}")
async def trigger_comment_summary(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Comment).where(Comment.ticket_id == ticket_id))
    comments = result.scalars().all()
    if not comments:
        return {"summary": "No comments available to summarize."}

    summary = ai_service.summarize_comments([c.content for c in comments])
    return {"ticket_id": ticket_id, "summary": summary}


@router.post("/sprint-risk/{sprint_id}")
async def trigger_sprint_risk_analysis(
    sprint_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s_res = await db.execute(select(Sprint).where(Sprint.id == sprint_id))
    sprint = s_res.scalars().first()
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found"
        )

    t_res = await db.execute(select(Ticket).where(Ticket.sprint_id == sprint_id))
    tickets = t_res.scalars().all()
    total_tickets = len(tickets)
    open_tickets = len([t for t in tickets if t.status != "done"])
    total_points = sum(t.estimate or 1 for t in tickets)
    completed_points = sum(t.estimate or 1 for t in tickets if t.status == "done")

    risk_res = ai_service.predict_sprint_risk(
        sprint_name=sprint.name,
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        days_left=7,
        total_points=total_points,
        completed_points=completed_points,
    )

    sprint.risk_score = risk_res["risk_score"]
    sprint.risk_reason = risk_res["risk_reason"]
    await db.commit()

    return {"sprint_id": sprint_id, "risk": risk_res}

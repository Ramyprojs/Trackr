import asyncio
import logging
from sqlalchemy import create_engine, select, func, update
from sqlalchemy.orm import sessionmaker

from app.celery_app import celery_app
from app.core.config import settings
from app.ai.service import ai_service
from app.models.ticket import Ticket, Comment, Sprint

logger = logging.getLogger(__name__)

# Sync Engine for Celery tasks
sync_db_url = settings.get_database_url().replace("postgresql+asyncpg://", "postgresql://").replace("sqlite+aiosqlite://", "sqlite://")
sync_engine = create_engine(sync_db_url, echo=False)
SyncSessionLocal = sessionmaker(bind=sync_engine)


@celery_app.task(name="app.tasks.ping_worker")
def ping_worker() -> dict:
    """Health check task for Celery worker."""
    logger.info("Celery worker ping received")
    return {"status": "ok", "message": "Celery worker is responsive"}


@celery_app.task(name="app.tasks.triage_ticket_task")
def triage_ticket_task(ticket_id: str) -> dict:
    """Async background task to triage ticket with Gemini AI."""
    session = SyncSessionLocal()
    try:
        ticket = session.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            return {"status": "error", "message": "Ticket not found"}

        triage_res = ai_service.triage_ticket(ticket.title, ticket.description or "")

        # Merge labels
        existing_labels = set(ticket.labels or [])
        new_labels = list(existing_labels.union(set(triage_res.get("labels", []))))

        ticket.labels = new_labels
        ticket.priority = triage_res.get("priority", ticket.priority)
        ticket.estimate = triage_res.get("estimate", ticket.estimate)
        ticket.ai_triage_status = "completed"

        session.commit()
        logger.info(f"Successfully triaged ticket {ticket_id}")
        return {"status": "success", "ticket_id": ticket_id, "triage": triage_res}
    except Exception as e:
        session.rollback()
        logger.error(f"Error in triage_ticket_task: {e}")
        return {"status": "error", "error": str(e)}
    finally:
        session.close()


@celery_app.task(name="app.tasks.summarize_ticket_comments_task")
def summarize_ticket_comments_task(ticket_id: str) -> dict:
    """Async background task to summarize comments for a ticket."""
    session = SyncSessionLocal()
    try:
        comments = (
            session.query(Comment)
            .filter(Comment.ticket_id == ticket_id)
            .order_by(Comment.created_at.asc())
            .all()
        )
        if len(comments) < 2:
            return {"status": "skipped", "reason": "Not enough comments to summarize"}

        comment_texts = [c.content for c in comments]
        summary = ai_service.summarize_comments(comment_texts)

        # Update latest comment or store summary
        latest_comment = comments[-1]
        latest_comment.ai_summary = summary
        session.commit()

        return {"status": "success", "ticket_id": ticket_id, "summary": summary}
    except Exception as e:
        session.rollback()
        logger.error(f"Error in summarize_ticket_comments_task: {e}")
        return {"status": "error", "error": str(e)}
    finally:
        session.close()


@celery_app.task(name="app.tasks.assess_sprint_risk_task")
def assess_sprint_risk_task(sprint_id: str) -> dict:
    """Async task to calculate sprint risk score & explanation."""
    session = SyncSessionLocal()
    try:
        sprint = session.query(Sprint).filter(Sprint.id == sprint_id).first()
        if not sprint:
            return {"status": "error", "message": "Sprint not found"}

        tickets = session.query(Ticket).filter(Ticket.sprint_id == sprint_id).all()
        total_tickets = len(tickets)
        open_tickets = len([t for t in tickets if t.status != "done"])

        total_points = sum(t.estimate or 1 for t in tickets)
        completed_points = sum(t.estimate or 1 for t in tickets if t.status == "done")

        days_left = 7  # Default if start/end date not set
        if sprint.end_date:
            from datetime import datetime
            days_left = max(0, (sprint.end_date - datetime.utcnow()).days)

        risk_res = ai_service.predict_sprint_risk(
            sprint_name=sprint.name,
            total_tickets=total_tickets,
            open_tickets=open_tickets,
            days_left=days_left,
            total_points=total_points,
            completed_points=completed_points,
        )

        sprint.risk_score = risk_res["risk_score"]
        sprint.risk_reason = risk_res["risk_reason"]
        session.commit()

        return {"status": "success", "sprint_id": sprint_id, "risk": risk_res}
    except Exception as e:
        session.rollback()
        logger.error(f"Error in assess_sprint_risk_task: {e}")
        return {"status": "error", "error": str(e)}
    finally:
        session.close()

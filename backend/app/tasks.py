import asyncio
import logging
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.ping_worker")
def ping_worker() -> dict:
    """Health check task for Celery worker."""
    logger.info("Celery worker ping received")
    return {"status": "ok", "message": "Celery worker is responsive"}


@celery_app.task(name="app.tasks.dummy_dispatch")
def dummy_dispatch(ticket_id: str) -> dict:
    """Dummy task demonstrating async job dispatch."""
    logger.info(f"Dummy job dispatched for ticket {ticket_id}")
    return {"status": "success", "ticket_id": ticket_id}

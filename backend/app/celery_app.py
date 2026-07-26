from celery import Celery
from app.core.config import settings

broker_url = settings.CELERY_BROKER_URL or settings.get_redis_url()
result_backend = settings.CELERY_RESULT_BACKEND or "redis://redis:6379/1"

celery_app = Celery(
    "trackr_tasks",
    broker=broker_url,
    backend=result_backend,
    include=["app.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

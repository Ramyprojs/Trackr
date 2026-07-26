from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.auth import UserResponse


class TicketCreate(BaseModel):
    project_id: str
    board_id: Optional[str] = None
    sprint_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"  # todo, in_progress, in_review, done
    priority: Optional[str] = "medium"  # low, medium, high, urgent
    labels: Optional[List[str]] = []
    estimate: Optional[int] = 1
    assignee_id: Optional[str] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    labels: Optional[List[str]] = None
    estimate: Optional[int] = None
    board_id: Optional[str] = None
    sprint_id: Optional[str] = None
    assignee_id: Optional[str] = None


class TicketResponse(BaseModel):
    id: str
    project_id: str
    board_id: Optional[str] = None
    sprint_id: Optional[str] = None
    ticket_key: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    labels: List[str]
    estimate: int
    assignee_id: Optional[str] = None
    creator_id: Optional[str] = None
    ai_triage_status: str
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class SprintCreate(BaseModel):
    project_id: str
    name: str
    goal: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None  # planning, active, completed
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class SprintResponse(BaseModel):
    id: str
    project_id: str
    name: str
    goal: Optional[str] = None
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    risk_score: str
    risk_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: str
    ticket_id: str
    author_id: str
    content: str
    ai_summary: Optional[str] = None
    created_at: datetime
    author: Optional[UserResponse] = None

    class Config:
        from_attributes = True

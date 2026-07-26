import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    board_id = Column(String(36), ForeignKey("boards.id", ondelete="CASCADE"), nullable=True)
    sprint_id = Column(String(36), ForeignKey("sprints.id", ondelete="SET NULL"), nullable=True)
    
    ticket_key = Column(String(50), index=True, nullable=False)  # e.g. TRK-1
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo", nullable=False)  # todo, in_progress, in_review, done
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, urgent
    labels = Column(JSON, default=list, nullable=False)  # e.g. ["frontend", "bug"]
    estimate = Column(Integer, default=1, nullable=False)  # story points
    
    assignee_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    ai_triage_status = Column(String(50), default="pending", nullable=False)  # pending, completed, failed
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="tickets")
    board = relationship("Board", back_populates="tickets")
    sprint = relationship("Sprint", back_populates="tickets")
    assignee = relationship("User", foreign_keys=[assignee_id])
    creator = relationship("User", foreign_keys=[creator_id])
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")


class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    goal = Column(Text, nullable=True)
    status = Column(String(50), default="planning", nullable=False)  # planning, active, completed
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    risk_score = Column(String(50), default="low", nullable=False)  # low, medium, high, critical
    risk_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="sprints")
    tickets = relationship("Ticket", back_populates="sprint")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="comments")
    author = relationship("User")

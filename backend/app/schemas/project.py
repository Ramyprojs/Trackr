from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class BoardCreate(BaseModel):
    name: str
    description: Optional[str] = None


class BoardResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name: str
    key: str
    description: Optional[str] = None
    workspace_id: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    key: str
    description: Optional[str] = None
    created_at: datetime
    boards: Optional[List[BoardResponse]] = []

    class Config:
        from_attributes = True

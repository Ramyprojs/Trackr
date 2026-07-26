from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.auth import UserResponse


class WorkspaceCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class WorkspaceMemberAdd(BaseModel):
    user_email: str
    role: str = "member"  # admin or member


class WorkspaceMemberResponse(BaseModel):
    id: str
    workspace_id: str
    user_id: str
    role: str
    joined_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime
    members: Optional[List[WorkspaceMemberResponse]] = []

    class Config:
        from_attributes = True

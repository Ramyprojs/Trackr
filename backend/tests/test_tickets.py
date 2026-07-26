import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_tickets_and_sprints_flow(client: AsyncClient):
    # Signup & Auth
    signup_data = {
        "email": "dev@example.com",
        "full_name": "Dev User",
        "password": "password123",
    }
    signup_resp = await client.post("/api/v1/auth/signup", json=signup_data)
    token = signup_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Workspace
    ws_resp = await client.post(
        "/api/v1/workspaces/",
        json={"name": "Dev Studio", "slug": "dev-studio"},
        headers=headers,
    )
    assert ws_resp.status_code == 201
    ws_id = ws_resp.json()["id"]

    # Create Project
    proj_resp = await client.post(
        "/api/v1/projects/",
        json={"name": "Core App", "key": "CAP", "workspace_id": ws_id},
        headers=headers,
    )
    assert proj_resp.status_code == 201
    proj_id = proj_resp.json()["id"]

    # Create Sprint
    sprint_resp = await client.post(
        "/api/v1/sprints/",
        json={"project_id": proj_id, "name": "Sprint 1"},
        headers=headers,
    )
    assert sprint_resp.status_code == 201
    sprint_id = sprint_resp.json()["id"]

    # Create Ticket
    ticket_resp = await client.post(
        "/api/v1/tickets/",
        json={
            "project_id": proj_id,
            "sprint_id": sprint_id,
            "title": "Build Auth System",
            "description": "Implement JWT and bcrypt",
            "priority": "high",
        },
        headers=headers,
    )
    assert ticket_resp.status_code == 201
    ticket_data = ticket_resp.json()
    assert ticket_data["ticket_key"] == "CAP-1"
    assert ticket_data["status"] == "todo"

    # Status Transition to in_progress
    update_resp = await client.patch(
        f"/api/v1/tickets/{ticket_data['id']}",
        json={"status": "in_progress"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "in_progress"

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ai_triage_and_sprint_risk(client: AsyncClient):
    # Setup user & project & ticket
    signup_resp = await client.post(
        "/api/v1/auth/signup",
        json={"email": "ai@example.com", "full_name": "AI User", "password": "pass"},
    )
    token = signup_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ws_resp = await client.post(
        "/api/v1/workspaces/",
        json={"name": "AI Space", "slug": "ai-space"},
        headers=headers,
    )
    ws_id = ws_resp.json()["id"]

    proj_resp = await client.post(
        "/api/v1/projects/",
        json={"name": "AI Proj", "key": "AIP", "workspace_id": ws_id},
        headers=headers,
    )
    proj_id = proj_resp.json()["id"]

    ticket_resp = await client.post(
        "/api/v1/tickets/",
        json={
            "project_id": proj_id,
            "title": "Fix critical login bug in auth system",
            "description": "User cannot sign in on Safari due to cookie settings",
        },
        headers=headers,
    )
    t_id = ticket_resp.json()["id"]

    # Trigger AI triage
    triage_resp = await client.post(f"/api/v1/ai/triage/{t_id}", headers=headers)
    assert triage_resp.status_code == 200
    res = triage_resp.json()
    assert res["status"] == "success"
    assert "labels" in res["suggested_triage"]
    assert "priority" in res["suggested_triage"]

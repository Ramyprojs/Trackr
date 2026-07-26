import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup_and_login(client: AsyncClient):
    # Signup
    signup_data = {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "securepassword123",
    }
    response = await client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

    # Login
    login_data = {
        "email": "test@example.com",
        "password": "securepassword123",
    }
    login_resp = await client.post("/api/v1/auth/login", json=login_data)
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Me
    me_resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["full_name"] == "Test User"

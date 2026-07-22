def test_register_user_returns_created_user_email(client):
    payload = {"email": "test@example.com", "password": "supersecure"}
    response = client.post("/auth/register", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == payload["email"]
    assert "id" in body


def test_login_after_registration_returns_token(client):
    credentials = {"email": "login@example.com", "password": "mypassword"}

    register_response = client.post("/auth/register", json=credentials)
    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json=credentials)
    assert login_response.status_code == 200
    login_body = login_response.json()
    assert "access_token" in login_body
    assert login_body["token_type"] == "bearer"

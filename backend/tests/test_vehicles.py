def test_create_vehicle_with_authenticated_user(client):
    credentials = {"email": "vehicle@example.com", "password": "vehpass123"}

    register_response = client.post("/auth/register", json=credentials)
    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json=credentials)
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    vehicle_payload = {
        "make": "Honda",
        "model": "Civic",
        "year": 2020,
        "nickname": "Daily Driver",
        "current_mileage": 25000,
    }

    response = client.post(
        "/vehicles",
        json=vehicle_payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 201
    body = response.json()
    assert "id" in body
    for field, value in vehicle_payload.items():
        assert body[field] == value
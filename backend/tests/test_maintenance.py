from datetime import date


def test_create_and_list_maintenance_record(client):
    credentials = {"email": "maint@example.com", "password": "maintpass"}

    register_response = client.post("/auth/register", json=credentials)
    assert register_response.status_code == 201

    login_response = client.post("/auth/login", json=credentials)
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    vehicle_payload = {
        "make": "Toyota",
        "model": "Camry",
        "year": 2018,
        "nickname": "Commuter",
        "current_mileage": 60000,
    }
    vehicle_response = client.post("/vehicles", json=vehicle_payload, headers=headers)
    assert vehicle_response.status_code == 201
    vehicle_id = vehicle_response.json()["id"]

    record_payload = {
        "service_type": "Oil Change",
        "service_date": date(2024, 1, 1).isoformat(),
        "mileage": 60500,
        "cost": 75.5,
        "notes": "Full synthetic",
    }
    record_response = client.post(
        f"/vehicles/{vehicle_id}/maintenance",
        json=record_payload,
        headers=headers,
    )
    assert record_response.status_code == 201

    history_response = client.get(
        f"/vehicles/{vehicle_id}/maintenance",
        headers=headers,
    )
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1


def test_service_due_returns_common_service_items(client):
    credentials = {"email": "service@example.com", "password": "servicepass"}

    assert client.post("/auth/register", json=credentials).status_code == 201
    login_response = client.post("/auth/login", json=credentials)
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    vehicle_payload = {
        "make": "Ford",
        "model": "F-150",
        "year": 2022,
        "nickname": "Workhorse",
        "current_mileage": 10000,
    }
    vehicle_response = client.post("/vehicles", json=vehicle_payload, headers=headers)
    assert vehicle_response.status_code == 201
    vehicle_id = vehicle_response.json()["id"]

    response = client.get(f"/vehicles/{vehicle_id}/service-due", headers=headers)
    assert response.status_code == 200
    body = response.json()

    service_types = {item["service_type"] for item in body["items"]}
    for expected in {"Oil Change", "Tire Rotation", "Air Filter", "Brake Inspection"}:
        assert expected in service_types
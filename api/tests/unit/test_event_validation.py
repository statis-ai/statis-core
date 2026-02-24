from fastapi.testclient import TestClient

def test_post_events_missing_required_field_returns_422(client: TestClient) -> None:
    payload = {
        "entity_type": "account",
        "entity_id": "acc_1",
        "event_type": "ticket.updated",
        "payload": {"ticket_id": "t_1"},
        "occurred_at": "2026-02-19T10:00:00Z",
        "producer": "support-agent",
        "schema_version": "1",
    }
    response = client.post("/events", json=payload)
    assert response.status_code == 422

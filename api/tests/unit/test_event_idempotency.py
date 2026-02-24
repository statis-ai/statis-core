from fastapi.testclient import TestClient

from app.api.deps import get_tenant_id
from app.main import app


def _valid_event() -> dict:
    return {
        "event_id": "evt_unit_1",
        "entity_type": "account",
        "entity_id": "acc_1",
        "event_type": "ticket.updated",
        "payload": {"ticket_id": "t_1"},
        "occurred_at": "2026-02-19T10:00:00Z",
        "producer": "support-agent",
        "schema_version": "1",
    }


def test_post_events_first_insert_returns_201(client: TestClient, monkeypatch) -> None:
    def _inserted(*_args, **_kwargs) -> bool:
        return True

    def _get_tenant_id_override():
        return "test_tenant_1"

    monkeypatch.setattr("app.api.routes.events.insert_event_idempotent", _inserted)
    app.dependency_overrides[get_tenant_id] = _get_tenant_id_override
    
    try:
        # We must patch get_tenant_id or pass the header to avoid 422/401
        headers = {"X-API-Key": "test_key_123"}
        response = client.post("/events", json=_valid_event(), headers=headers)

        assert response.status_code == 201
        assert response.json() == {"accepted": True, "event_id": "evt_unit_1"}
    finally:
        app.dependency_overrides.clear()


def test_post_events_duplicate_returns_200(client: TestClient, monkeypatch) -> None:
    def _duplicate(*_args, **_kwargs) -> bool:
        return False

    def _get_tenant_id_override():
        return "test_tenant_1"

    monkeypatch.setattr("app.api.routes.events.insert_event_idempotent", _duplicate)
    app.dependency_overrides[get_tenant_id] = _get_tenant_id_override
    
    try:
        headers = {"X-API-Key": "test_key_123"}
        response = client.post("/events", json=_valid_event(), headers=headers)

        assert response.status_code == 200
        assert response.json() == {"accepted": True, "event_id": "evt_unit_1"}
    finally:
        app.dependency_overrides.clear()

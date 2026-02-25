"""RBAC-lite tests.

Verifies that role-based filtering works:
- billing role cannot see sentiment events or state fields
- admin (role=None) sees everything
"""
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def _seed_events(client: TestClient) -> None:
    """Seed two events: one sentiment, one incident."""
    events = [
        {
            "event_id": "rbac_evt_1",
            "entity_type": "account",
            "entity_id": "acme",
            "event_type": "support.incident_reported",
            "payload": {
                "incident_id": "INC-1",
                "type": "incident",
                "status": "open",
                "severity": "high",
                "summary": "Login outage",
                "occurred_at": "2026-01-01T00:00:00Z",
            },
            "occurred_at": "2026-01-01T00:00:00Z",
            "producer": "pagerduty",
            "schema_version": "1",
        },
        {
            "event_id": "rbac_evt_2",
            "entity_type": "account",
            "entity_id": "acme",
            "event_type": "support.sentiment_updated",
            "payload": {
                "label": "negative",
                "updated_at": "2026-01-01T01:00:00Z",
            },
            "occurred_at": "2026-01-01T01:00:00Z",
            "producer": "zendesk",
            "schema_version": "1",
        },
    ]
    for evt in events:
        resp = client.post("/events", json=evt)
        assert resp.status_code in (200, 201)


def test_admin_sees_all_events(
    client: TestClient,
    db_session: Session,
):
    _seed_events(client)

    resp = client.get("/events", params={"entity_type": "account", "entity_id": "acme"})
    assert resp.status_code == 200
    event_types = [e["event_type"] for e in resp.json()]
    assert "support.incident_reported" in event_types
    assert "support.sentiment_updated" in event_types


def test_billing_cannot_see_sentiment_events(
    client: TestClient,
    client_billing: TestClient,
    db_session: Session,
):
    _seed_events(client)

    resp = client_billing.get("/events", params={"entity_type": "account", "entity_id": "acme"})
    assert resp.status_code == 200
    event_types = [e["event_type"] for e in resp.json()]
    assert "support.incident_reported" in event_types
    assert "support.sentiment_updated" not in event_types


def test_admin_sees_full_state(
    client: TestClient,
    db_session: Session,
):
    _seed_events(client)

    resp = client.get("/state/account/acme")
    assert resp.status_code == 200
    state = resp.json()["state"]
    assert "sentiment" in state


def test_billing_gets_redacted_state(
    client: TestClient,
    client_billing: TestClient,
    db_session: Session,
):
    _seed_events(client)

    resp = client_billing.get("/state/account/acme")
    assert resp.status_code == 200
    state = resp.json()["state"]
    assert "sentiment" not in state
    assert "blockers" in state

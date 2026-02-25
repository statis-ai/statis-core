"""Cross-tenant isolation tests.

Verifies that tenant_B keys cannot access tenant_A resources.
Per OWASP best practice, cross-tenant lookups return 404 (not 403)
to avoid leaking resource existence.
"""
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def _seed_event(client: TestClient) -> str:
    """Post a sentiment event for account/acme and return the event_id."""
    event = {
        "event_id": "iso_evt_1",
        "entity_type": "account",
        "entity_id": "acme",
        "event_type": "support.sentiment_updated",
        "payload": {"label": "negative", "updated_at": "2026-01-01T00:00:00Z"},
        "occurred_at": "2026-01-01T00:00:00Z",
        "producer": "zendesk",
        "schema_version": "1",
    }
    resp = client.post("/events", json=event)
    assert resp.status_code in (200, 201)
    return event["event_id"]


def test_tenant_b_cannot_see_tenant_a_events(
    client: TestClient,
    client_tenant2: TestClient,
    db_session: Session,
):
    _seed_event(client)

    resp = client_tenant2.get("/events", params={"entity_type": "account", "entity_id": "acme"})
    assert resp.status_code == 200
    assert resp.json() == []


def test_tenant_b_cannot_see_tenant_a_state(
    client: TestClient,
    client_tenant2: TestClient,
    db_session: Session,
):
    _seed_event(client)

    resp = client_tenant2.get("/state/account/acme")
    assert resp.status_code == 404


def test_tenant_b_cannot_see_tenant_a_subscriptions(
    client: TestClient,
    client_tenant2: TestClient,
    db_session: Session,
):
    create_resp = client.post(
        "/subscriptions",
        json={
            "entity_type": "account",
            "destination": "https://example.com/hook",
        },
    )
    assert create_resp.status_code == 201
    sub_id = create_resp.json()["subscription_id"]

    resp = client_tenant2.get(f"/subscriptions/{sub_id}")
    assert resp.status_code == 404

    list_resp = client_tenant2.get("/subscriptions")
    assert list_resp.status_code == 200
    assert list_resp.json() == []


def test_tenant_b_cannot_see_tenant_a_deliveries(
    client: TestClient,
    client_tenant2: TestClient,
    db_session: Session,
):
    _seed_event(client)

    resp = client_tenant2.get(
        "/deliveries", params={"entity_type": "account", "entity_id": "acme"}
    )
    assert resp.status_code == 200
    assert resp.json() == []

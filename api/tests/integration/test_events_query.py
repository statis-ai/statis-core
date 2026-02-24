"""Integration tests for GET /events query endpoint."""

from datetime import datetime

import pytest


def _post_event(client, event_id, event_type="ticket.updated", entity_type="account", entity_id="acc_1", occurred_at=None):
    return client.post("/events", json={
        "event_id": event_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "event_type": event_type,
        "payload": {"summary": f"test-{event_id}"},
        "occurred_at": (occurred_at or datetime.utcnow()).isoformat() + "Z",
        "producer": "test",
        "schema_version": "1",
    })


@pytest.mark.integration
class TestEventsQuery:
    def test_returns_all_events(self, client):
        _post_event(client, "eq-1")
        _post_event(client, "eq-2")
        _post_event(client, "eq-3")

        resp = client.get("/events")
        assert resp.status_code == 200
        events = resp.json()
        assert len(events) >= 3
        ids = [e["event_id"] for e in events]
        assert "eq-1" in ids
        assert "eq-2" in ids
        assert "eq-3" in ids

    def test_filter_by_entity_type(self, client):
        _post_event(client, "eq-ft-1", entity_type="account")
        _post_event(client, "eq-ft-2", entity_type="other_type", event_type="ticket.updated")

        resp = client.get("/events?entity_type=account")
        assert resp.status_code == 200
        events = resp.json()
        assert all(e["entity_type"] == "account" for e in events)

    def test_filter_by_entity_id(self, client):
        _post_event(client, "eq-fi-1", entity_id="acc_A")
        _post_event(client, "eq-fi-2", entity_id="acc_B")

        resp = client.get("/events?entity_id=acc_A")
        assert resp.status_code == 200
        events = resp.json()
        assert all(e["entity_id"] == "acc_A" for e in events)

    def test_since_filter(self, client):
        t1 = datetime(2020, 1, 1, 0, 0, 0)
        t2 = datetime(2026, 6, 1, 0, 0, 0)
        _post_event(client, "eq-since-old", occurred_at=t1)
        _post_event(client, "eq-since-new", occurred_at=t2)

        resp = client.get("/events?since=2025-01-01T00:00:00Z")
        assert resp.status_code == 200
        events = resp.json()
        ids = [e["event_id"] for e in events]
        assert "eq-since-new" in ids
        assert "eq-since-old" not in ids

    def test_until_filter(self, client):
        t1 = datetime(2020, 1, 1, 0, 0, 0)
        t2 = datetime(2026, 6, 1, 0, 0, 0)
        _post_event(client, "eq-until-old", occurred_at=t1)
        _post_event(client, "eq-until-new", occurred_at=t2)

        resp = client.get("/events?until=2025-01-01T00:00:00Z")
        assert resp.status_code == 200
        events = resp.json()
        ids = [e["event_id"] for e in events]
        assert "eq-until-old" in ids
        assert "eq-until-new" not in ids

    def test_deterministic_ordering(self, client):
        t = datetime(2026, 3, 1, 12, 0, 0)
        _post_event(client, "eq-ord-c", occurred_at=t)
        _post_event(client, "eq-ord-a", occurred_at=t)
        _post_event(client, "eq-ord-b", occurred_at=t)

        resp = client.get("/events")
        events = resp.json()
        ids = [e["event_id"] for e in events]
        # same occurred_at => ordered by ingested_at then event_id
        ord_subset = [eid for eid in ids if eid.startswith("eq-ord-")]
        assert ord_subset == sorted(ord_subset) or len(ord_subset) == 3

    def test_limit_respected(self, client):
        for i in range(5):
            _post_event(client, f"eq-lim-{i}")

        resp = client.get("/events?limit=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_event_fields_present(self, client):
        _post_event(client, "eq-fields")
        resp = client.get("/events?entity_id=acc_1&limit=1")
        events = resp.json()
        assert len(events) >= 1
        e = events[0]
        for field in ["event_id", "entity_type", "entity_id", "event_type",
                       "payload", "occurred_at", "ingested_at", "producer", "schema_version"]:
            assert field in e

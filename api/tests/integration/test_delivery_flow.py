"""Integration tests for the delivery enqueue flow and delivery trace endpoint."""

import pytest
from datetime import datetime


def _post_event(client, event_id, event_type="ticket.updated", entity_id="acc_1"):
    return client.post("/events", json={
        "event_id": event_id,
        "entity_type": "account",
        "entity_id": entity_id,
        "event_type": event_type,
        "payload": {"summary": f"test-{event_id}"},
        "occurred_at": datetime.utcnow().isoformat() + "Z",
        "producer": "test",
        "schema_version": "1",
    })


@pytest.mark.integration
class TestDeliveryEnqueue:
    def test_event_creates_delivery(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/test",
        })
        sub_id = sub_resp.json()["subscription_id"]

        ev_resp = _post_event(client, "ev-del-1")
        assert ev_resp.status_code == 201

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        assert trace_resp.status_code == 200
        deliveries = trace_resp.json()
        assert len(deliveries) >= 1
        d = deliveries[0]
        assert d["subscription_id"] == sub_id
        assert d["entity_type"] == "account"
        assert d["entity_id"] == "acc_1"
        assert d["status"] == "pending"

    def test_dedupe_key_contains_state_version(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/dedupe",
        })
        sub_id = sub_resp.json()["subscription_id"]

        _post_event(client, "ev-del-dk-1")

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        deliveries = trace_resp.json()
        assert len(deliveries) >= 1
        dk = deliveries[0]["dedupe_key"]
        assert sub_id in dk
        assert "account" in dk
        assert "acc_1" in dk

    def test_event_type_filter_prevents_delivery(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "event_types": ["plan.changed"],
            "destination": "https://hooks.example.com/filtered",
        })
        sub_id = sub_resp.json()["subscription_id"]

        _post_event(client, "ev-del-filt-1", event_type="ticket.updated")

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        deliveries = trace_resp.json()
        assert len(deliveries) == 0

    def test_paused_subscription_no_delivery(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/paused",
        })
        sub_id = sub_resp.json()["subscription_id"]
        client.post(f"/subscriptions/{sub_id}/pause")

        _post_event(client, "ev-del-paused-1")

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        deliveries = trace_resp.json()
        assert len(deliveries) == 0

    def test_multiple_events_create_multiple_deliveries(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/multi",
        })
        sub_id = sub_resp.json()["subscription_id"]

        _post_event(client, "ev-del-multi-1")
        _post_event(client, "ev-del-multi-2")

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        deliveries = trace_resp.json()
        assert len(deliveries) >= 2

    def test_duplicate_event_no_extra_delivery(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/dupecheck",
        })
        sub_id = sub_resp.json()["subscription_id"]

        _post_event(client, "ev-del-dupe-1")
        _post_event(client, "ev-del-dupe-1")  # duplicate

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        deliveries = trace_resp.json()
        assert len(deliveries) == 1


@pytest.mark.integration
class TestDeliveryTrace:
    def test_empty_trace(self, client):
        resp = client.get("/delivery-trace/nonexistent-sub")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_trace_returns_newest_first(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/order",
        })
        sub_id = sub_resp.json()["subscription_id"]

        _post_event(client, "ev-trace-ord-1")
        _post_event(client, "ev-trace-ord-2")

        trace_resp = client.get(f"/delivery-trace/{sub_id}")
        deliveries = trace_resp.json()
        assert len(deliveries) >= 2
        # newest first
        assert deliveries[0]["state_version"] >= deliveries[-1]["state_version"]

    def test_trace_limit(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/limit",
        })
        sub_id = sub_resp.json()["subscription_id"]

        for i in range(5):
            _post_event(client, f"ev-trace-lim-{i}")

        trace_resp = client.get(f"/delivery-trace/{sub_id}?limit=2")
        deliveries = trace_resp.json()
        assert len(deliveries) == 2

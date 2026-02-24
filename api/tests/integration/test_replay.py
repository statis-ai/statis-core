"""Integration tests for POST /replay endpoint."""

from datetime import datetime

import pytest


def _post_event(client, event_id, event_type="ticket.updated"):
    return client.post("/events", json={
        "event_id": event_id,
        "entity_type": "account",
        "entity_id": "acc_rp",
        "event_type": event_type,
        "payload": {"ticket_id": event_id, "status": "open", "occurred_at": "2026-01-01T00:00:00Z"},
        "occurred_at": datetime.utcnow().isoformat() + "Z",
        "producer": "test",
        "schema_version": "1",
    })


def _seed_events(client, count=5):
    for i in range(1, count + 1):
        _post_event(client, f"rp-ev-{i}")


@pytest.mark.integration
class TestReplay:
    def test_replay_enqueues_deliveries_for_new_subscription(self, client):
        _seed_events(client)

        # Create a NEW subscription (no prior deliveries)
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/replay-test",
        })
        sub_id = sub_resp.json()["subscription_id"]

        resp = client.post("/replay", json={
            "subscription_id": sub_id,
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["enqueued"] == 5
        assert body["skipped"] == 0

        # Verify deliveries are visible in the trace
        trace = client.get(f"/delivery-trace/{sub_id}").json()
        assert len(trace) == 5
        versions = sorted(d["state_version"] for d in trace)
        assert versions == [1, 2, 3, 4, 5]

    def test_replay_dedupe_skips_already_enqueued(self, client):
        _seed_events(client)

        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/replay-dedupe",
        })
        sub_id = sub_resp.json()["subscription_id"]

        # First replay
        resp1 = client.post("/replay", json={"subscription_id": sub_id})
        assert resp1.json()["enqueued"] == 5

        # Second replay — all should be skipped
        resp2 = client.post("/replay", json={"subscription_id": sub_id})
        assert resp2.json()["enqueued"] == 0
        assert resp2.json()["skipped"] == 5

    def test_replay_from_rev_to_rev(self, client):
        _seed_events(client)

        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/replay-range",
        })
        sub_id = sub_resp.json()["subscription_id"]

        resp = client.post("/replay", json={
            "subscription_id": sub_id,
            "from_rev": 2,
            "to_rev": 4,
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["enqueued"] == 3  # revs 2, 3, 4

        trace = client.get(f"/delivery-trace/{sub_id}").json()
        versions = sorted(d["state_version"] for d in trace)
        assert versions == [2, 3, 4]

    def test_replay_with_entity_type_filter(self, client):
        _seed_events(client)

        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/replay-filter",
        })
        sub_id = sub_resp.json()["subscription_id"]

        resp = client.post("/replay", json={
            "subscription_id": sub_id,
            "entity_type": "account",
        })
        assert resp.status_code == 200
        assert resp.json()["enqueued"] == 5

    def test_replay_subscription_not_found(self, client):
        resp = client.post("/replay", json={
            "subscription_id": "nonexistent-sub",
        })
        assert resp.status_code == 404

    def test_replay_paused_subscription_returns_409(self, client):
        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/replay-paused",
        })
        sub_id = sub_resp.json()["subscription_id"]
        client.post(f"/subscriptions/{sub_id}/pause")

        resp = client.post("/replay", json={
            "subscription_id": sub_id,
        })
        assert resp.status_code == 409

    def test_replay_to_rev_exceeds_current_clamps(self, client):
        """to_rev larger than state_version is clamped, not an error."""
        _seed_events(client, count=3)

        sub_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/replay-clamp",
        })
        sub_id = sub_resp.json()["subscription_id"]

        resp = client.post("/replay", json={
            "subscription_id": sub_id,
            "to_rev": 999,
        })
        assert resp.status_code == 200
        assert resp.json()["enqueued"] == 3  # clamped to state_version=3

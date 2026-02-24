"""E2E integration test: CSM demo scenario — state + delivery records + trace."""

import pytest
from datetime import datetime, timezone

# Same scenario as examples/csm_demo.py (order and payloads) for deterministic state
ENTITY_TYPE = "account"
ENTITY_ID = "acc_e2e_csm_demo"
SCENARIO = [
    ("support.ticket_updated", {"ticket_id": "t_100", "status": "open", "occurred_at": "2026-02-19T09:00:00Z"}, "system"),
    ("support.incident_reported", {
        "incident_id": "inc_200", "type": "outage", "status": "open", "severity": "high",
        "summary": "Production DB outage", "occurred_at": "2026-02-19T09:05:00Z",
    }, "system"),
    ("billing.plan_changed", {"plan": "enterprise"}, "system"),
    ("support.sentiment_updated", {"label": "negative", "updated_at": "2026-02-19T09:10:00Z"}, "human"),
    ("csm.escalation_requested", {"owner": "sales", "action": "schedule QBR call", "reason": "churn risk after outage"}, "agent"),
    ("support.ticket_updated", {"ticket_id": "t_100", "status": "closed", "occurred_at": "2026-02-19T09:25:00Z"}, "system"),
    ("billing.plan_changed", {"plan": "pro"}, "system"),
]


def _post_event(client, event_id: str, event_type: str, payload: dict, producer: str):
    return client.post("/events", json={
        "event_id": event_id,
        "entity_type": ENTITY_TYPE,
        "entity_id": ENTITY_ID,
        "event_type": event_type,
        "payload": payload,
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "producer": producer,
        "schema_version": "1",
    })


@pytest.mark.integration
class TestCsmDemoE2E:
    """Full CSM scenario: seed events, assert final state + hash + delivery records/trace."""

    def test_final_state_shape_and_hash(self, client):
        for i, (event_type, payload, producer) in enumerate(SCENARIO, start=1):
            r = _post_event(client, f"e2e_{ENTITY_ID}_{i}", event_type, payload, producer)
            assert r.status_code in (201, 200), r.text

        r = client.get(f"/state/{ENTITY_TYPE}/{ENTITY_ID}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "state" in data
        assert "state_version" in data
        assert "state_hash" in data
        assert data["state_version"] == 7
        state = data["state"]
        # Expected v2 account shape
        assert "schema_version" in state
        assert state.get("plan") == "pro"
        assert "churn_risk" in state
        assert "blockers" in state
        assert "open_incidents" in state
        assert "next_actions" in state
        assert "sentiment" in state
        # Determinism: hash present and non-empty
        assert data["state_hash"]
        hash1 = data["state_hash"]
        r2 = client.get(f"/state/{ENTITY_TYPE}/{ENTITY_ID}")
        assert r2.status_code == 200
        assert r2.json()["state_hash"] == hash1

    def test_delivery_records_and_trace_present(self, client):
        sub = client.post("/subscriptions", json={
            "entity_type": ENTITY_TYPE,
            "destination": "https://example.com/webhook",
        })
        assert sub.status_code == 201
        subscription_id = sub.json()["subscription_id"]

        for i, (event_type, payload, producer) in enumerate(SCENARIO, start=1):
            r = _post_event(client, f"e2e_trace_{ENTITY_ID}_{i}", event_type, payload, producer)
            assert r.status_code in (201, 200), r.text

        trace = client.get(f"/delivery-trace/{subscription_id}", params={"limit": 20})
        assert trace.status_code == 200
        deliveries = trace.json()
        assert len(deliveries) >= 7
        for d in deliveries[:7]:
            assert d["subscription_id"] == subscription_id
            assert d["entity_type"] == ENTITY_TYPE
            assert d["entity_id"] == ENTITY_ID
            assert d["status"] in ("pending", "sent", "failed", "dead")
            assert "dedupe_key" in d
            assert "attempt_count" in d

        state = client.get(f"/state/{ENTITY_TYPE}/{ENTITY_ID}").json()
        assert state["state_version"] == 7

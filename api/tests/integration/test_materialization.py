import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session


def _event(event_id: str, entity_id: str, event_type: str, payload: dict, occurred_at: str) -> dict:
    return {
        "event_id": event_id,
        "entity_type": "account",
        "entity_id": entity_id,
        "event_type": event_type,
        "payload": payload,
        "occurred_at": occurred_at,
        "producer": "test",
        "schema_version": "1",
    }


@pytest.mark.integration
class TestMaterialization:

    def test_determinism_identical_state_hash(self, client, db_session: Session) -> None:
        """Same event sequence on two entities must produce identical state_hash."""
        events_a = [
            _event("a1", "acc_A", "ticket.updated", {"ticket_id": "t1", "status": "open"}, "2026-02-19T10:00:00Z"),
            _event("a2", "acc_A", "plan.changed", {"plan": "enterprise"}, "2026-02-19T10:01:00Z"),
        ]
        events_b = [
            _event("b1", "acc_B", "ticket.updated", {"ticket_id": "t1", "status": "open"}, "2026-02-19T10:00:00Z"),
            _event("b2", "acc_B", "plan.changed", {"plan": "enterprise"}, "2026-02-19T10:01:00Z"),
        ]
        for e in events_a + events_b:
            r = client.post("/events", json=e)
            assert r.status_code == 201

        state_a = client.get("/state/account/acc_A")
        state_b = client.get("/state/account/acc_B")
        assert state_a.status_code == 200
        assert state_b.status_code == 200
        assert state_a.json()["state_hash"] == state_b.json()["state_hash"]
        assert state_a.json()["state"] == state_b.json()["state"]

    def test_provenance_contains_all_event_ids(self, client) -> None:
        events = [
            _event("p1", "acc_P", "ticket.updated", {"ticket_id": "t1", "status": "open"}, "2026-02-19T10:00:00Z"),
            _event("p2", "acc_P", "ticket.updated", {"ticket_id": "t1", "status": "closed"}, "2026-02-19T10:01:00Z"),
            _event("p3", "acc_P", "plan.changed", {"plan": "pro"}, "2026-02-19T10:02:00Z"),
        ]
        for e in events:
            client.post("/events", json=e)

        state = client.get("/state/account/acc_P").json()
        assert state["provenance"] == ["p1", "p2", "p3"]
        assert state["state_version"] == 3
        assert state["last_event_id"] == "p3"

    def test_duplicate_event_does_not_change_state(self, client) -> None:
        evt = _event("d1", "acc_D", "ticket.updated", {"ticket_id": "t1", "status": "open"}, "2026-02-19T10:00:00Z")
        assert client.post("/events", json=evt).status_code == 201
        before = client.get("/state/account/acc_D").json()

        assert client.post("/events", json=evt).status_code == 200
        after = client.get("/state/account/acc_D").json()

        assert before["state_version"] == after["state_version"]
        assert before["state_hash"] == after["state_hash"]
        assert before["provenance"] == after["provenance"]

    def test_state_404_for_unknown_entity(self, client) -> None:
        r = client.get("/state/account/nonexistent")
        assert r.status_code == 404

    def test_state_reflects_deterministic_ordering(self, client, db_session: Session) -> None:
        """Events with different occurred_at must be applied in deterministic order."""
        events = [
            _event("o2", "acc_O", "plan.changed", {"plan": "enterprise"}, "2026-02-19T10:02:00Z"),
            _event("o1", "acc_O", "plan.changed", {"plan": "starter"}, "2026-02-19T10:01:00Z"),
        ]
        for e in events:
            client.post("/events", json=e)

        state = client.get("/state/account/acc_O").json()
        assert state["state_version"] == 2

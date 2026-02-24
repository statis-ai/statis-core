"""Integration tests for the Account State Pack v2.

Requires Postgres (via testcontainers).
"""
import pytest
from sqlalchemy.orm import Session

from app.utils.hashing import canonical_state_hash


def _post_event(client, event_id: str, entity_id: str, event_type: str,
                payload: dict, occurred_at: str, producer: str = "test") -> dict:
    body = {
        "event_id": event_id,
        "entity_type": "account",
        "entity_id": entity_id,
        "event_type": event_type,
        "payload": payload,
        "occurred_at": occurred_at,
        "producer": producer,
        "schema_version": "1",
    }
    return client.post("/events", json=body)


CSM_SCENARIO = [
    ("evt_1", "support.ticket_updated", {"ticket_id": "t1", "status": "open", "occurred_at": "2026-02-19T09:00:00Z"}, "2026-02-19T09:00:00Z", "system"),
    ("evt_2", "support.incident_reported", {"incident_id": "inc1", "type": "outage", "status": "open", "severity": "high", "summary": "DB outage", "occurred_at": "2026-02-19T09:05:00Z"}, "2026-02-19T09:05:00Z", "system"),
    ("evt_3", "billing.plan_changed", {"plan": "enterprise"}, "2026-02-19T09:10:00Z", "system"),
    ("evt_4", "support.sentiment_updated", {"label": "negative", "updated_at": "2026-02-19T09:15:00Z"}, "2026-02-19T09:15:00Z", "human"),
    ("evt_5", "csm.escalation_requested", {"owner": "sales", "action": "schedule call", "reason": "churn risk"}, "2026-02-19T09:20:00Z", "agent"),
    ("evt_6", "support.ticket_updated", {"ticket_id": "t1", "status": "closed", "occurred_at": "2026-02-19T09:25:00Z"}, "2026-02-19T09:25:00Z", "system"),
    ("evt_7", "billing.plan_changed", {"plan": "pro"}, "2026-02-19T09:30:00Z", "system"),
]


@pytest.mark.integration
class TestAccountPack:

    def test_determinism_same_hash(self, client, db_session: Session) -> None:
        """Same event stream on two entities must produce identical state_hash."""
        for suffix in ("A", "B"):
            for i, (eid, etype, payload, occ, prod) in enumerate(CSM_SCENARIO):
                _post_event(client, f"{eid}_{suffix}", f"acc_{suffix}",
                            etype, payload, occ, prod)

        sa = client.get("/state/account/acc_A").json()
        sb = client.get("/state/account/acc_B").json()
        assert sa["state_hash"] == sb["state_hash"]
        assert sa["state"] == sb["state"]

    def test_golden_scenario_via_api(self, client, db_session: Session) -> None:
        """Full CSM scenario produces expected v2 state shape."""
        for eid, etype, payload, occ, prod in CSM_SCENARIO:
            r = _post_event(client, eid, "acc_golden", etype, payload, occ, prod)
            assert r.status_code == 201

        state = client.get("/state/account/acc_golden").json()
        s = state["state"]

        assert s["schema_version"] == "account.v2"
        assert s["plan"] == "pro"
        assert "DB outage" in s["blockers"]
        assert any("plan_downgrade" in f for f in s["risk_flags"])
        assert s["sentiment"]["label"] == "negative"
        assert len(s["next_actions"]) == 1
        assert state["state_version"] == 7
        assert state["provenance"] == [f"evt_{i}" for i in range(1, 8)]

    def test_alias_equivalence(self, client, db_session: Session) -> None:
        """Old event type name and canonical name produce identical state."""
        _post_event(client, "alias_old", "acc_alias_old",
                     "ticket.updated",
                     {"ticket_id": "t1", "status": "open"}, "2026-02-19T10:00:00Z")
        _post_event(client, "alias_new", "acc_alias_new",
                     "support.ticket_updated",
                     {"ticket_id": "t1", "status": "open"}, "2026-02-19T10:00:00Z")

        s_old = client.get("/state/account/acc_alias_old").json()
        s_new = client.get("/state/account/acc_alias_new").json()
        assert s_old["state_hash"] == s_new["state_hash"]
        assert s_old["state"] == s_new["state"]

    def test_duplicate_does_not_change_v2_state(self, client, db_session: Session) -> None:
        _post_event(client, "dup_v2", "acc_dup_v2",
                     "support.incident_reported",
                     {"incident_id": "inc_x", "severity": "low"},
                     "2026-02-19T10:00:00Z")
        before = client.get("/state/account/acc_dup_v2").json()

        r = _post_event(client, "dup_v2", "acc_dup_v2",
                         "support.incident_reported",
                         {"incident_id": "inc_x", "severity": "low"},
                         "2026-02-19T10:00:00Z")
        assert r.status_code == 200
        after = client.get("/state/account/acc_dup_v2").json()

        assert before["state_version"] == after["state_version"]
        assert before["state_hash"] == after["state_hash"]

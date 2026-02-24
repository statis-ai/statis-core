"""Integration tests for the time-machine endpoint and rebuild-from-scratch determinism."""

from datetime import datetime

import pytest
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models.entity_state import EntityState
from app.models.event import Event
from app.repositories.state_replay import compute_state_at_rev, replay_all


def _post_event(client, event_id, event_type="ticket.updated", payload=None, occurred_at=None):
    return client.post("/events", json={
        "event_id": event_id,
        "entity_type": "account",
        "entity_id": "acc_tm",
        "event_type": event_type,
        "payload": payload or {"ticket_id": event_id, "status": "open", "occurred_at": "2026-01-01T00:00:00Z"},
        "occurred_at": (occurred_at or datetime.utcnow()).isoformat() + "Z",
        "producer": "system",
        "schema_version": "1",
    })


def _seed_events(client):
    """Post 5 events that each trigger state changes."""
    _post_event(client, "tm-1", "ticket.updated", {"ticket_id": "t1", "status": "open", "occurred_at": "2026-01-01T00:00:00Z"})
    _post_event(client, "tm-2", "billing.plan_changed", {"plan": "enterprise"})
    _post_event(client, "tm-3", "ticket.updated", {"ticket_id": "t2", "status": "open", "occurred_at": "2026-01-01T01:00:00Z"})
    _post_event(client, "tm-4", "billing.plan_changed", {"plan": "pro"})
    _post_event(client, "tm-5", "ticket.updated", {"ticket_id": "t1", "status": "closed", "occurred_at": "2026-01-01T02:00:00Z"})


@pytest.mark.integration
class TestTimeMachine:
    def test_state_at_rev_1(self, client):
        _seed_events(client)

        resp = client.get("/state/account/acc_tm/at?rev=1")
        assert resp.status_code == 200
        body = resp.json()
        assert body["state_version"] == 1
        assert len(body["provenance"]) == 1
        assert body["provenance"][0] == "tm-1"
        assert body["state_hash"] is not None

    def test_state_at_rev_3(self, client):
        _seed_events(client)

        resp = client.get("/state/account/acc_tm/at?rev=3")
        assert resp.status_code == 200
        body = resp.json()
        assert body["state_version"] == 3
        assert len(body["provenance"]) == 3
        assert body["provenance"] == ["tm-1", "tm-2", "tm-3"]

    def test_state_at_current_rev_matches_get_state(self, client):
        _seed_events(client)

        current = client.get("/state/account/acc_tm").json()
        at_max = client.get(f"/state/account/acc_tm/at?rev={current['state_version']}").json()

        assert current["state_hash"] == at_max["state_hash"]
        assert current["state"] == at_max["state"]

    def test_rev_exceeds_current_returns_400(self, client):
        _seed_events(client)

        resp = client.get("/state/account/acc_tm/at?rev=999")
        assert resp.status_code == 400
        assert "exceeds" in resp.json()["detail"]

    def test_rev_zero_returns_422(self, client):
        _seed_events(client)

        resp = client.get("/state/account/acc_tm/at?rev=0")
        assert resp.status_code == 422

    def test_entity_not_found_returns_404(self, client):
        resp = client.get("/state/account/nonexistent/at?rev=1")
        assert resp.status_code == 404

    def test_determinism_across_revisions(self, client):
        """Each revision's hash is unique and stable across repeated computation."""
        _seed_events(client)

        hashes = []
        for rev in range(1, 6):
            resp = client.get(f"/state/account/acc_tm/at?rev={rev}")
            assert resp.status_code == 200
            hashes.append(resp.json()["state_hash"])

        # all hashes are unique
        assert len(set(hashes)) == 5

        # re-requesting same rev gives same hash
        resp2 = client.get("/state/account/acc_tm/at?rev=3")
        assert resp2.json()["state_hash"] == hashes[2]


@pytest.mark.integration
class TestRebuildFromScratch:
    def test_rebuild_produces_identical_hashes(self, client, db_session: Session):
        """Delete entity_state, recompute from events => same hash at each rev."""
        _seed_events(client)

        # Capture current state for comparison
        current_state = client.get("/state/account/acc_tm").json()
        current_hash = current_state["state_hash"]
        current_version = current_state["state_version"]

        # Capture hash at each rev via the API
        original_hashes = {}
        for rev in range(1, current_version + 1):
            resp = client.get(f"/state/account/acc_tm/at?rev={rev}")
            original_hashes[rev] = resp.json()["state_hash"]

        # Delete entity_state row
        db_session.execute(
            text("DELETE FROM entity_state WHERE entity_type='account' AND entity_id='acc_tm'")
        )
        db_session.commit()

        # Rebuild: load all events in deterministic order and replay
        events = (
            db_session.execute(
                select(Event)
                .where(Event.entity_type == "account", Event.entity_id == "acc_tm")
                .order_by(Event.occurred_at.asc(), Event.ingested_at.asc(), Event.event_id.asc())
            )
            .scalars()
            .all()
        )

        snapshots = replay_all(events)
        assert len(snapshots) == current_version

        for rev, state, rebuilt_hash, provenance in snapshots:
            assert rebuilt_hash == original_hashes[rev], (
                f"Hash mismatch at rev {rev}: original={original_hashes[rev]}, rebuilt={rebuilt_hash}"
            )

        # Final state hash matches
        assert snapshots[-1][2] == current_hash

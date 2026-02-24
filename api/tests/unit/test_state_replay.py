"""Unit tests for compute_state_at_rev and replay_all."""

from types import SimpleNamespace

import pytest

from app.repositories.state_replay import compute_state_at_rev, replay_all
from app.utils.hashing import canonical_state_hash


def _make_event(event_id, event_type, payload, producer="system"):
    return SimpleNamespace(
        event_id=event_id,
        event_type=event_type,
        payload=payload,
        producer=producer,
    )


EVENTS = [
    _make_event("e1", "ticket.updated", {"ticket_id": "t1", "status": "open", "occurred_at": "2026-01-01T00:00:00Z"}),
    _make_event("e2", "billing.plan_changed", {"plan": "enterprise"}, "system"),
    _make_event("e3", "ticket.updated", {"ticket_id": "t1", "status": "closed", "occurred_at": "2026-01-01T01:00:00Z"}),
]


class TestComputeStateAtRev:
    def test_rev_1_produces_first_state(self):
        state, hash_, prov = compute_state_at_rev(EVENTS, 1)
        assert "open_incidents" in state or "tickets" in state or "schema_version" in state
        assert len(prov) == 1
        assert prov[0] == "e1"
        assert hash_ == canonical_state_hash(state)

    def test_rev_2_includes_plan(self):
        state, hash_, prov = compute_state_at_rev(EVENTS, 2)
        assert state.get("plan") == "enterprise"
        assert len(prov) == 2
        assert prov == ["e1", "e2"]

    def test_rev_3_includes_all(self):
        state, hash_, prov = compute_state_at_rev(EVENTS, 3)
        assert len(prov) == 3
        assert prov == ["e1", "e2", "e3"]

    def test_first_n_revisions_are_stable(self):
        _, hash_at_2, _ = compute_state_at_rev(EVENTS, 2)
        _, hash_at_3, _ = compute_state_at_rev(EVENTS, 3)
        # re-computing at rev 2 gives the same hash
        _, hash_at_2_again, _ = compute_state_at_rev(EVENTS, 2)
        assert hash_at_2 == hash_at_2_again
        assert hash_at_2 != hash_at_3

    def test_rev_zero_raises(self):
        with pytest.raises(ValueError, match="target_rev must be >= 1"):
            compute_state_at_rev(EVENTS, 0)

    def test_rev_exceeds_events_raises(self):
        with pytest.raises(ValueError, match="Only 3 state-changing events"):
            compute_state_at_rev(EVENTS, 10)

    def test_events_without_reducers_are_skipped(self):
        events_with_unknown = [
            _make_event("u1", "unknown.type", {"x": 1}),
            *EVENTS,
        ]
        state, _, prov = compute_state_at_rev(events_with_unknown, 1)
        assert prov[0] == "e1"


class TestReplayAll:
    def test_returns_snapshot_per_rev(self):
        snapshots = replay_all(EVENTS)
        assert len(snapshots) == 3
        for rev, state, hash_, prov in snapshots:
            assert hash_ == canonical_state_hash(state)
            assert len(prov) == rev

    def test_snapshot_hashes_match_compute_state_at_rev(self):
        snapshots = replay_all(EVENTS)
        for rev, _, snap_hash, _ in snapshots:
            _, rev_hash, _ = compute_state_at_rev(EVENTS, rev)
            assert snap_hash == rev_hash

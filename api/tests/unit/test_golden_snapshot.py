"""Golden snapshot test: a known event stream produces an expected final
state dict and state_hash.  This guards against accidental reducer changes.
"""
from types import SimpleNamespace

from app.reducers.account import (
    reduce_escalation_requested,
    reduce_incident_reported,
    reduce_plan_changed,
    reduce_sentiment_updated,
    reduce_ticket_updated,
)
from app.reducers.registry import get_reducer
from app.utils.hashing import canonical_state_hash

GOLDEN_EVENTS = [
    ("support.ticket_updated", {"ticket_id": "t1", "status": "open", "occurred_at": "2026-02-19T09:00:00Z"}, "system"),
    ("support.incident_reported", {"incident_id": "inc1", "type": "outage", "status": "open", "severity": "high", "summary": "DB outage", "occurred_at": "2026-02-19T09:05:00Z"}, "system"),
    ("billing.plan_changed", {"plan": "enterprise"}, "system"),
    ("support.sentiment_updated", {"label": "negative", "updated_at": "2026-02-19T09:10:00Z"}, "human"),
    ("csm.escalation_requested", {"owner": "sales", "action": "schedule call", "reason": "churn risk"}, "agent"),
    ("support.ticket_updated", {"ticket_id": "t1", "status": "closed", "occurred_at": "2026-02-19T09:15:00Z"}, "system"),
    ("billing.plan_changed", {"plan": "pro"}, "system"),
]

GOLDEN_STATE = {
    "schema_version": "account.v2",
    "blockers": ["DB outage"],
    "risk_flags": ["plan_downgrade:enterprise->pro"],
    "sentiment": {"label": "negative", "updated_at": "2026-02-19T09:10:00Z", "source": "human"},
    "open_incidents": [
        {"id": "t1", "type": "ticket", "status": "closed", "occurred_at": "2026-02-19T09:15:00Z"},
        {"id": "inc1", "type": "outage", "status": "open", "occurred_at": "2026-02-19T09:05:00Z"},
    ],
    "churn_risk": False,
    "next_actions": [{"owner": "sales", "action": "schedule call", "reason": "churn risk"}],
    "plan": "pro",
    "ltv": 0,
    "last_discount_at": None,
    "extensions": {},
}

GOLDEN_HASH = canonical_state_hash(GOLDEN_STATE)


def _apply_events(events: list) -> dict:
    state: dict = {}
    for event_type, payload, producer in events:
        evt = SimpleNamespace(event_type=event_type, payload=payload, producer=producer)
        reducer = get_reducer(event_type)
        state = reducer(state, evt)
    return state


def test_golden_snapshot_state() -> None:
    result = _apply_events(GOLDEN_EVENTS)
    assert result == GOLDEN_STATE


def test_golden_snapshot_hash() -> None:
    result = _apply_events(GOLDEN_EVENTS)
    assert canonical_state_hash(result) == GOLDEN_HASH


def test_golden_snapshot_deterministic_replay() -> None:
    """Replaying the same events twice produces identical state and hash."""
    a = _apply_events(GOLDEN_EVENTS)
    b = _apply_events(GOLDEN_EVENTS)
    assert a == b
    assert canonical_state_hash(a) == canonical_state_hash(b)

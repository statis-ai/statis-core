"""Tests for the v2 account reducers and registry (updated for M2.5).

These tests validate that the M2 reducer API contract still holds:
reducers are pure, deterministic, and the registry resolves both
canonical and aliased event types.
"""
from types import SimpleNamespace

from app.reducers.account import reduce_plan_changed, reduce_ticket_updated
from app.reducers.registry import get_reducer, has_reducer


def _event(event_type: str, payload: dict, producer: str = "test") -> SimpleNamespace:
    return SimpleNamespace(event_type=event_type, payload=payload, producer=producer)


# -- support.ticket_updated (alias: ticket.updated) -----------------------

def test_ticket_updated_on_empty_state() -> None:
    evt = _event("ticket.updated", {"ticket_id": "t_1", "status": "open"})
    result = reduce_ticket_updated({}, evt)
    assert result["schema_version"] == "account.v2"
    incident = next(i for i in result["open_incidents"] if i["id"] == "t_1")
    assert incident["status"] == "open"


def test_ticket_updated_merges_into_existing() -> None:
    evt1 = _event("ticket.updated", {"ticket_id": "t_1", "status": "open"})
    state = reduce_ticket_updated({}, evt1)
    evt2 = _event("ticket.updated", {"ticket_id": "t_1", "status": "closed"})
    result = reduce_ticket_updated(state, evt2)
    incident = next(i for i in result["open_incidents"] if i["id"] == "t_1")
    assert incident["status"] == "closed"


def test_ticket_updated_does_not_mutate_input() -> None:
    state = {"plan": "starter"}
    evt = _event("ticket.updated", {"ticket_id": "t_1", "status": "open"})
    reduce_ticket_updated(state, evt)
    assert "open_incidents" not in state


# -- billing.plan_changed (alias: plan.changed) ---------------------------

def test_plan_changed_on_empty_state() -> None:
    evt = _event("plan.changed", {"plan": "enterprise"})
    result = reduce_plan_changed({}, evt)
    assert result["plan"] == "enterprise"
    assert result["schema_version"] == "account.v2"


def test_plan_changed_overwrites_previous() -> None:
    evt1 = _event("plan.changed", {"plan": "starter"})
    state = reduce_plan_changed({}, evt1)
    evt2 = _event("plan.changed", {"plan": "enterprise"})
    result = reduce_plan_changed(state, evt2)
    assert result["plan"] == "enterprise"


def test_plan_changed_does_not_mutate_input() -> None:
    state = {"plan": "starter"}
    evt = _event("plan.changed", {"plan": "enterprise"})
    reduce_plan_changed(state, evt)
    assert state["plan"] == "starter"


# -- determinism -----------------------------------------------------------

def test_reducers_are_deterministic() -> None:
    evt = _event("ticket.updated", {"ticket_id": "t_1", "status": "open"})
    a = reduce_ticket_updated({}, evt)
    b = reduce_ticket_updated({}, evt)
    assert a == b


# -- registry (aliases + canonical) ----------------------------------------

def test_registry_has_expected_types() -> None:
    assert has_reducer("support.ticket_updated")
    assert has_reducer("billing.plan_changed")
    assert has_reducer("support.incident_reported")
    assert has_reducer("support.sentiment_updated")
    assert has_reducer("csm.escalation_requested")
    assert has_reducer("account.schema_migrated")
    assert not has_reducer("nonexistent.type")


def test_registry_resolves_aliases() -> None:
    assert has_reducer("ticket.updated")
    assert has_reducer("plan.changed")
    assert get_reducer("ticket.updated") is reduce_ticket_updated
    assert get_reducer("plan.changed") is reduce_plan_changed


def test_registry_returns_correct_functions() -> None:
    assert get_reducer("support.ticket_updated") is reduce_ticket_updated
    assert get_reducer("billing.plan_changed") is reduce_plan_changed

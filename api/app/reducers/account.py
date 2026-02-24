"""Account-entity v2 reducers for the CSM demo.

Each reducer is a pure function: (current_state, event) -> new_state.
No randomness, no now(), no side effects.  All reducers ensure the state
is upgraded to v2 before applying domain logic.
"""
from __future__ import annotations

from typing import Any

from app.reducers.account_schema import ensure_v2, upgrade_v1_to_v2
from app.reducers.conflict_rules import should_apply


def _payload(event: Any) -> dict:
    return event.payload if hasattr(event, "payload") else event["payload"]


def _producer(event: Any) -> str:
    if hasattr(event, "producer"):
        return event.producer
    return event.get("producer", "")


# -- support.ticket_updated (alias: ticket.updated) -----------------------

def reduce_ticket_updated(state: dict, event: Any) -> dict:
    """Upsert into open_incidents and derive churn_risk."""
    state = ensure_v2(state)
    p = _payload(event)
    ticket_id = p.get("ticket_id", "unknown")

    existing = next(
        (i for i in state["open_incidents"] if i["id"] == ticket_id), None
    )
    incident = {
        "id": ticket_id,
        "type": "ticket",
        "status": p.get("status", "open"),
        "occurred_at": p.get("occurred_at", ""),
    }
    if existing is not None:
        existing.update(incident)
    else:
        state["open_incidents"].append(incident)

    open_count = sum(
        1 for i in state["open_incidents"] if i.get("status") not in ("closed", "resolved")
    )
    state["churn_risk"] = open_count >= 3
    return state


# -- support.incident_reported ---------------------------------------------

def reduce_incident_reported(state: dict, event: Any) -> dict:
    """Append to open_incidents; add blocker if severity is high."""
    state = ensure_v2(state)
    p = _payload(event)
    incident = {
        "id": p.get("incident_id", "unknown"),
        "type": p.get("type", "incident"),
        "status": p.get("status", "open"),
        "occurred_at": p.get("occurred_at", ""),
    }
    state["open_incidents"].append(incident)

    severity = p.get("severity", "").lower()
    if severity in ("high", "critical"):
        blocker = p.get("summary", f"Incident {incident['id']}")
        if blocker not in state["blockers"]:
            state["blockers"].append(blocker)

    open_count = sum(
        1 for i in state["open_incidents"] if i.get("status") not in ("closed", "resolved")
    )
    state["churn_risk"] = open_count >= 3
    return state


# -- support.sentiment_updated --------------------------------------------

def reduce_sentiment_updated(state: dict, event: Any) -> dict:
    """Set sentiment label with source-precedence check."""
    state = ensure_v2(state)
    p = _payload(event)
    new_producer = _producer(event)

    existing_source = None
    if state["sentiment"] is not None:
        existing_source = state["sentiment"].get("source")

    if should_apply(existing_source, new_producer):
        state["sentiment"] = {
            "label": p.get("label", "neutral"),
            "updated_at": p.get("updated_at", ""),
            "source": new_producer,
        }
    return state


# -- billing.plan_changed (alias: plan.changed) ---------------------------

def reduce_plan_changed(state: dict, event: Any) -> dict:
    """Set plan; flag risk on downgrade."""
    state = ensure_v2(state)
    p = _payload(event)
    old_plan = state["plan"]
    new_plan = p.get("plan", p)
    state["plan"] = new_plan

    if old_plan is not None and _is_downgrade(old_plan, new_plan):
        flag = f"plan_downgrade:{old_plan}->{new_plan}"
        if flag not in state["risk_flags"]:
            state["risk_flags"].append(flag)

    return state


_PLAN_RANK = {"free": 0, "starter": 1, "pro": 2, "enterprise": 3}


def _is_downgrade(old: str, new: str) -> bool:
    return _PLAN_RANK.get(str(new).lower(), 0) < _PLAN_RANK.get(str(old).lower(), 0)


# -- csm.escalation_requested ---------------------------------------------

def reduce_escalation_requested(state: dict, event: Any) -> dict:
    """Append to next_actions."""
    state = ensure_v2(state)
    p = _payload(event)
    action = {
        "owner": p.get("owner", "csm"),
        "action": p.get("action", ""),
        "reason": p.get("reason", ""),
    }
    state["next_actions"].append(action)
    return state


# -- account.schema_migrated ----------------------------------------------

def reduce_schema_migrated(state: dict, event: Any) -> dict:
    """Deterministic v1 -> v2 upgrade. Idempotent if already v2."""
    return upgrade_v1_to_v2(state)

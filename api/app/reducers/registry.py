"""Reducer registry: maps event_type -> pure reducer function.

Supports aliases so legacy event names (e.g. ``ticket.updated``) resolve
to their canonical counterparts (``support.ticket_updated``) transparently.
The event log always stores the original name; only routing uses the alias.
"""
from __future__ import annotations

from typing import Any, Callable, Dict

ReducerFn = Callable[[dict, Any], dict]

_REGISTRY: Dict[str, ReducerFn] = {}

_ALIASES: Dict[str, str] = {
    "ticket.updated": "support.ticket_updated",
    "plan.changed": "billing.plan_changed",
}


def register(event_type: str, fn: ReducerFn) -> None:
    """Register a reducer for a canonical event_type."""
    _REGISTRY[event_type] = fn


def _bootstrap() -> None:
    """Register all built-in reducers. Called once at module load."""
    from app.reducers.account import (
        reduce_churn_risk_updated,
        reduce_discount_applied,
        reduce_escalation_requested,
        reduce_incident_reported,
        reduce_ltv_updated,
        reduce_plan_changed,
        reduce_schema_migrated,
        reduce_sentiment_updated,
        reduce_ticket_updated,
    )

    register("support.ticket_updated", reduce_ticket_updated)
    register("support.incident_reported", reduce_incident_reported)
    register("support.sentiment_updated", reduce_sentiment_updated)
    register("billing.plan_changed", reduce_plan_changed)
    register("billing.ltv_updated", reduce_ltv_updated)
    register("billing.discount_applied", reduce_discount_applied)
    register("csm.escalation_requested", reduce_escalation_requested)
    register("account.churn_risk_updated", reduce_churn_risk_updated)
    register("account.schema_migrated", reduce_schema_migrated)


_bootstrap()


def _resolve(event_type: str) -> str:
    """Return the canonical event_type, following aliases."""
    return _ALIASES.get(event_type, event_type)


def get_reducer(event_type: str) -> ReducerFn:
    """Return the reducer for *event_type* (resolving aliases) or raise ValueError."""
    canonical = _resolve(event_type)
    fn = _REGISTRY.get(canonical)
    if fn is None:
        raise ValueError(f"No reducer registered for event_type={event_type!r}")
    return fn


def has_reducer(event_type: str) -> bool:
    canonical = _resolve(event_type)
    return canonical in _REGISTRY

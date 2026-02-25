"""RBAC-lite: role-based visibility filtering for events and state.

A role of None or "admin" means full access (no filtering).
Unknown roles default to full access to avoid accidentally locking out
keys created before roles were configured.
"""
from __future__ import annotations

from typing import Optional, Sequence

ROLE_HIDDEN_EVENT_TYPES: dict[str, set[str]] = {
    "billing": {"support.sentiment_updated"},
    "sales": set(),
    "csm": set(),
}

ROLE_REDACTED_STATE_FIELDS: dict[str, set[str]] = {
    "billing": {"sentiment"},
    "sales": set(),
    "csm": set(),
}


def _is_unrestricted(role: Optional[str]) -> bool:
    return role is None or role == "admin"


def filter_events_for_role(events: Sequence, role: Optional[str]) -> list:
    """Remove events whose event_type is hidden for the given role."""
    if _is_unrestricted(role):
        return list(events)
    hidden = ROLE_HIDDEN_EVENT_TYPES.get(role, set())
    if not hidden:
        return list(events)
    return [e for e in events if e.event_type not in hidden]


def redact_state_for_role(state: dict, role: Optional[str]) -> dict:
    """Return a copy of state with role-restricted fields removed."""
    if _is_unrestricted(role):
        return state
    redacted_fields = ROLE_REDACTED_STATE_FIELDS.get(role, set())
    if not redacted_fields:
        return state
    return {k: v for k, v in state.items() if k not in redacted_fields}

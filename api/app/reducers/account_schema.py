"""Account v2 state schema helpers.

Provides the canonical empty state and a deterministic v1 -> v2 upgrade.
"""
from __future__ import annotations

import copy
from typing import Any, Dict


SCHEMA_VERSION = "account.v2"


def init_account_v2() -> Dict[str, Any]:
    """Return a fresh v2 state with all fields at their zero values."""
    return {
        "schema_version": SCHEMA_VERSION,
        "blockers": [],
        "risk_flags": [],
        "sentiment": None,
        "open_incidents": [],
        "churn_risk": False,
        "next_actions": [],
        "plan": None,
        "extensions": {},
    }


def upgrade_v1_to_v2(old_state: dict) -> Dict[str, Any]:
    """Deterministically migrate a v1 (or empty) state dict to v2 shape.

    Legacy fields that don't map to v2 top-level keys are preserved under
    ``extensions``.
    """
    if old_state.get("schema_version") == SCHEMA_VERSION:
        return copy.deepcopy(old_state)

    new = init_account_v2()

    if "plan" in old_state:
        new["plan"] = old_state["plan"]

    if "tickets" in old_state:
        for tid, tdata in old_state["tickets"].items():
            incident = {
                "id": tid,
                "type": "ticket",
                "status": tdata.get("status", "unknown"),
                "occurred_at": tdata.get("occurred_at", ""),
            }
            new["open_incidents"].append(incident)
        new["extensions"]["tickets"] = copy.deepcopy(old_state["tickets"])

    v1_keys = {"plan", "tickets", "schema_version"}
    for k, v in old_state.items():
        if k not in v1_keys:
            new["extensions"][k] = copy.deepcopy(v)

    return new


def ensure_v2(state: dict) -> dict:
    """If *state* is not already v2, upgrade it. Always returns a deep copy."""
    if state.get("schema_version") == SCHEMA_VERSION:
        return copy.deepcopy(state)
    return upgrade_v1_to_v2(state)

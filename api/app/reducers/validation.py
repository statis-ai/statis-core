"""Reducer output validation using Pydantic models."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ValidationError


class ReducerOutputInvalid(Exception):
    """Raised when reducer output fails schema validation."""


class AccountStateV2(BaseModel):
    """Pydantic model matching the v2 account state schema."""
    schema_version: str
    plan: Optional[Any] = None
    sentiment: Optional[Any] = None
    open_incidents: List[Any] = []
    blockers: List[Any] = []
    risk_flags: List[Any] = []
    next_actions: List[Any] = []
    churn_risk: bool = False
    extensions: Dict[str, Any] = {}

    model_config = {"extra": "allow"}


def validate_reducer_output(state: dict) -> dict:
    """Validate *state* against the appropriate schema model.

    Only states with ``schema_version == "account.v2"`` are validated;
    all others pass through unchanged.  Returns the original dict on success.
    Raises ReducerOutputInvalid on validation failure.
    """
    if state.get("schema_version") != "account.v2":
        return state

    try:
        AccountStateV2.model_validate(state)
        return state
    except ValidationError as exc:
        raise ReducerOutputInvalid(
            f"Reducer output validation failed: {exc}"
        ) from exc

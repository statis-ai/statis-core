import json
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, field_validator


class ActionStatus(str, Enum):
    PROPOSED = "PROPOSED"
    EVALUATING = "EVALUATING"
    APPROVED = "APPROVED"          # AARM: ALLOW
    DENIED = "DENIED"              # AARM: DENY
    ESCALATED = "ESCALATED"        # legacy alias — equivalent to STEP_UP
    STEP_UP = "STEP_UP"            # AARM R4: STEP_UP (canonical)
    DEFERRED = "DEFERRED"          # AARM R4: DEFER
    MODIFIED = "MODIFIED"          # AARM R4: MODIFY (parameter transformation lands in PR-AARM-05)
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SHADOW_COMPLETE = "SHADOW_COMPLETE"

    @classmethod
    def normalize(cls, v: str) -> "ActionStatus":
        """Return the AARM-canonical form. ESCALATED collapses to STEP_UP."""
        if v == "ESCALATED":
            return cls.STEP_UP
        return cls(v)


# AARM R4 canonical decision set (spec §VII.B.R4).
AARM_DECISIONS: frozenset[str] = frozenset({"ALLOW", "DENY", "STEP_UP", "DEFER", "MODIFY"})

# Maps internal status values to AARM canonical decision names for receipts/telemetry.
LEGACY_TO_AARM: dict[str, str] = {
    "APPROVED": "ALLOW",
    "DENIED": "DENY",
    "ESCALATED": "STEP_UP",
    "STEP_UP": "STEP_UP",
    "DEFERRED": "DEFER",
    "MODIFIED": "MODIFY",
}

# Decisions that evaluator/route handlers may persist on action_contracts.status.
# Terminal-for-worker means the execution worker will not dispatch these.
NON_DISPATCHABLE_DECISIONS: frozenset[str] = frozenset(
    {"DENIED", "ESCALATED", "STEP_UP", "DEFERRED", "MODIFIED"}
)


def _check_depth(obj: Any, max_depth: int = 10, current: int = 0) -> None:
    """Recursively check nesting depth of a dict or list, raising ValueError if exceeded."""
    if current > max_depth:
        raise ValueError("exceeds max nesting depth (10)")
    if isinstance(obj, dict):
        for v in obj.values():
            _check_depth(v, max_depth, current + 1)
    elif isinstance(obj, list):
        for v in obj:
            _check_depth(v, max_depth, current + 1)


def _validate_jsonb_field(value: Any, field_name: str) -> dict:
    """Validate that value is a dict, does not exceed 64 KB serialized, and has depth <= 10."""
    if not isinstance(value, dict):
        raise ValueError(f"{field_name} must be a JSON object (dict), got {type(value).__name__}")
    serialized = json.dumps(value)
    if len(serialized) > 65536:
        raise ValueError(f"{field_name} exceeds maximum allowed size of 64 KB")
    _check_depth(value)
    return value


class ActionIn(BaseModel):
    action_id: str
    proposed_by: str
    action_type: str
    target_entity: dict[str, Any]
    target_system: str
    parameters: dict[str, Any]
    context: dict[str, Any] = {}
    mode: str = "live"

    @field_validator("parameters")
    @classmethod
    def validate_parameters(cls, v: Any) -> dict:
        return _validate_jsonb_field(v, "parameters")

    @field_validator("context")
    @classmethod
    def validate_context(cls, v: Any) -> dict:
        return _validate_jsonb_field(v, "context")

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: Any) -> str:
        if v not in ("live", "shadow"):
            raise ValueError("mode must be 'live' or 'shadow'")
        return v


class ActionAccepted(BaseModel):
    action_id: str
    status: ActionStatus


class ActionCompleteIn(BaseModel):
    execution_result: dict[str, Any] = {}


class ActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action_id: str
    proposed_by: str
    action_type: str
    target_entity: dict[str, Any]
    target_system: str
    parameters: dict[str, Any]
    context: dict[str, Any]
    status: ActionStatus
    created_at: datetime
    updated_at: datetime
    mode: str | None = None
    # AARM R6 — 4-layer identity binding. NULL on pre-R6 actions.
    agent_class: str | None = None
    org_unit: str | None = None
    trust_source: str | None = None

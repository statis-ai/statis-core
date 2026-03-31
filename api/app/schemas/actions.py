import json
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, field_validator


class ActionStatus(str, Enum):
    PROPOSED = "PROPOSED"
    EVALUATING = "EVALUATING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    ESCALATED = "ESCALATED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


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

    @field_validator("parameters")
    @classmethod
    def validate_parameters(cls, v: Any) -> dict:
        return _validate_jsonb_field(v, "parameters")

    @field_validator("context")
    @classmethod
    def validate_context(cls, v: Any) -> dict:
        return _validate_jsonb_field(v, "context")


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

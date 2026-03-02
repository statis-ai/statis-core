from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict


class ActionStatus(str, Enum):
    PROPOSED = "PROPOSED"
    EVALUATING = "EVALUATING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    ESCALATED = "ESCALATED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ActionIn(BaseModel):
    action_id: str
    proposed_by: str
    action_type: str
    target_entity: dict[str, Any]
    target_system: str
    parameters: dict[str, Any]
    context: dict[str, Any] = {}


class ActionAccepted(BaseModel):
    action_id: str
    status: ActionStatus


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

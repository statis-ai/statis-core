from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, field_validator

# AARM R4 accepts five decisions: ALLOW, DENY, STEP_UP, DEFER, MODIFY.
# Internally we use the legacy verb forms (APPROVED/DENIED/ESCALATED) plus the
# new AARM forms (STEP_UP/DEFERRED/MODIFIED). ESCALATED is an alias for STEP_UP
# and is accepted indefinitely for back-compat with seeded rules.
VALID_DECISIONS: frozenset[str] = frozenset(
    {"APPROVED", "DENIED", "ESCALATED", "STEP_UP", "DEFERRED", "MODIFIED"}
)


def _validate_decision(v: str) -> str:
    if v not in VALID_DECISIONS:
        raise ValueError(
            f"decision must be one of {sorted(VALID_DECISIONS)}, got '{v}'"
        )
    return v


class PolicyRuleIn(BaseModel):
    rule_id: str
    rule_version: str = "1"
    action_type: str
    conditions: dict[str, Any]
    decision: str = "APPROVED"
    priority: int = 0
    active: bool = True
    description: Optional[str] = None

    @field_validator("decision")
    @classmethod
    def check_decision(cls, v: str) -> str:
        return _validate_decision(v)


class PolicyRuleUpdate(BaseModel):
    rule_version: Optional[str] = None
    action_type: Optional[str] = None
    conditions: Optional[dict[str, Any]] = None
    decision: Optional[str] = None
    priority: Optional[int] = None
    active: Optional[bool] = None
    description: Optional[str] = None

    @field_validator("decision")
    @classmethod
    def check_decision(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return _validate_decision(v)


class PolicyRuleOut(PolicyRuleIn):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

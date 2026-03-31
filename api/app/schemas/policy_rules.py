from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class PolicyRuleIn(BaseModel):
    rule_id: str
    rule_version: str = "1"
    action_type: str
    conditions: dict[str, Any]
    decision: str = "APPROVED"
    priority: int = 0
    active: bool = True
    description: Optional[str] = None


class PolicyRuleUpdate(BaseModel):
    rule_version: Optional[str] = None
    action_type: Optional[str] = None
    conditions: Optional[dict[str, Any]] = None
    decision: Optional[str] = None
    priority: Optional[int] = None
    active: Optional[bool] = None
    description: Optional[str] = None


class PolicyRuleOut(PolicyRuleIn):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

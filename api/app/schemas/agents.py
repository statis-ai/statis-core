from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AgentCreate(BaseModel):
    agent_id: str
    name: str
    allowed_action_types: list[str] = []
    rate_limit_per_hour: Optional[int] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    allowed_action_types: Optional[list[str]] = None
    rate_limit_per_hour: Optional[int] = None
    is_active: Optional[bool] = None


class AgentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    agent_id: str
    tenant_id: str
    name: str
    allowed_action_types: list[str]
    rate_limit_per_hour: Optional[int]
    is_active: bool
    created_at: datetime

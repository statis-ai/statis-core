from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class ReceiptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    receipt_id: str
    action_id: str
    decision: str
    rule_id: Optional[str]
    rule_version: Optional[str]
    approved_by: str
    executed_at: Optional[datetime]
    execution_result: Optional[dict[str, Any]]
    hash: str
    conditions_evaluated: Optional[dict[str, Any]]
    entity_state_snapshot: Optional[dict[str, Any]]
    created_at: datetime

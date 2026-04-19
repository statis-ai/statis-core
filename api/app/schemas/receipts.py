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
    # AARM R5 — Ed25519 signature over canonical signing payload. NULL on
    # legacy (pre-PR-AARM-02) receipts; populated on all new receipts.
    signature: Optional[str] = None
    signature_alg: Optional[str] = None
    public_key_id: Optional[str] = None
    conditions_evaluated: Optional[dict[str, Any]]
    entity_state_snapshot: Optional[dict[str, Any]]
    created_at: datetime

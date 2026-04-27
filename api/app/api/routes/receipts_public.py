"""Public receipts page — `/r/{tenant_id}/{receipt_id}`.

No auth header. The receipt_id is itself unguessable (UUID4 today; opaque
random by design). The tenant_id in the path is verified against the
receipt's underlying contract — a mismatch is treated as a 404, never as a
redirect, so probing one tenant for another's receipt yields no signal.

The payload is what the public landing renders: the receipt + the action's
canonical decision metadata + signing alg + executor result if present.
Lane 3b consumes this through Next.js server components.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.receipt import Receipt

router = APIRouter(tags=["receipts-public"])


class PublicReceiptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    receipt_id: str
    action_id: str
    tenant_id: str
    action_type: str
    target_system: str
    target_entity: dict[str, Any]
    decision: str
    decided_at: datetime
    executed_at: Optional[datetime] = None
    execution_result: Optional[dict[str, Any]] = None
    hash: str
    signature: Optional[str] = None
    signature_alg: Optional[str] = None
    public_key_id: Optional[str] = None


@router.get("/r/{tenant_id}/{receipt_id}", response_model=PublicReceiptResponse)
def public_receipt(
    tenant_id: str,
    receipt_id: str,
    db: Session = Depends(get_db),
) -> PublicReceiptResponse:
    receipt = db.query(Receipt).filter(Receipt.receipt_id == receipt_id).first()
    if receipt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    contract = (
        db.query(ActionContract)
        .filter(ActionContract.action_id == receipt.action_id)
        .first()
    )
    # 404 on tenant mismatch — never redirect, never reveal which tenant it
    # actually belongs to. A scraper iterating over tenant_ids for the same
    # receipt_id learns nothing.
    if contract is None or contract.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    decided_at = contract.decided_at or receipt.created_at
    return PublicReceiptResponse(
        receipt_id=receipt.receipt_id,
        action_id=receipt.action_id,
        tenant_id=contract.tenant_id,
        action_type=contract.action_type,
        target_system=contract.target_system,
        target_entity=contract.target_entity or {},
        decision=receipt.decision,
        decided_at=decided_at,
        executed_at=receipt.executed_at,
        execution_result=receipt.execution_result,
        hash=receipt.hash,
        signature=receipt.signature,
        signature_alg=receipt.signature_alg,
        public_key_id=receipt.public_key_id,
    )

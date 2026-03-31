from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.receipt import Receipt
from app.schemas.receipts import ReceiptOut
from app.utils.hashing import canonical_state_hash

router = APIRouter(tags=["receipts"])


class ReceiptVerifyResponse(BaseModel):
    receipt_id: str
    action_type: str
    tenant_id_prefix: str
    status: str
    evaluated_at: datetime
    hash: str
    hash_valid: bool
    rule_ids_evaluated: list[str]


@router.get("/receipts/{action_id}", response_model=ReceiptOut)
def get_receipt(
    action_id: str,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> ReceiptOut:
    # Verify the action belongs to this tenant before returning the receipt.
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == action_id,
            ActionContract.tenant_id == auth.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found",
        )
    receipt = db.query(Receipt).filter(Receipt.action_id == action_id).first()
    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No receipt for action '{action_id}'",
        )
    return ReceiptOut.model_validate(receipt)


@router.get("/receipts/{receipt_id}/verify", response_model=ReceiptVerifyResponse)
def verify_receipt(
    receipt_id: str,
    db: Session = Depends(get_db),
) -> ReceiptVerifyResponse:
    receipt = db.query(Receipt).filter(Receipt.receipt_id == receipt_id).first()
    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt '{receipt_id}' not found",
        )

    contract = (
        db.query(ActionContract)
        .filter(ActionContract.action_id == receipt.action_id)
        .first()
    )
    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action contract for receipt '{receipt_id}' not found",
        )

    # Re-compute canonical hash using the same fields as at creation time
    recomputed = canonical_state_hash({
        "receipt_id": receipt.receipt_id,
        "action_id": receipt.action_id,
        "decision": receipt.decision,
        "rule_id": receipt.rule_id,
        "rule_version": receipt.rule_version,
        "approved_by": receipt.approved_by,
        "executed_at": receipt.executed_at.isoformat() if receipt.executed_at else None,
        "execution_result": receipt.execution_result,
        "created_at": receipt.created_at.isoformat(),
    })

    rule_ids_evaluated = [receipt.rule_id] if receipt.rule_id else []

    return ReceiptVerifyResponse(
        receipt_id=receipt.receipt_id,
        action_type=contract.action_type,
        tenant_id_prefix=contract.tenant_id[:8],
        status=receipt.decision,
        evaluated_at=receipt.created_at,
        hash=receipt.hash,
        hash_valid=(recomputed == receipt.hash),
        rule_ids_evaluated=rule_ids_evaluated,
    )

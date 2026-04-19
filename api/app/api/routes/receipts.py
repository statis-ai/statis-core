from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.crypto import (
    KeyNotConfiguredError,
    SignatureVerificationError,
    active_public_key_pem,
    canonical_signing_payload,
    verify_receipt_signature,
)
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
    # AARM R5 — Ed25519 signature verification result.
    # None on legacy (pre-PR-AARM-02) receipts that predate signing.
    signature_valid: Optional[bool] = None
    signature_alg: Optional[str] = None
    public_key_id: Optional[str] = None
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

    # AARM R5 — if the receipt carries an Ed25519 signature, verify it
    # against the currently-active public key. Legacy receipts (NULL
    # signature) return signature_valid=None; they still have a valid
    # hash check above, they just predate the signing pipeline.
    sig_valid: Optional[bool] = None
    if receipt.signature is not None and receipt.signature_alg is not None:
        try:
            pub_pem = active_public_key_pem()
            payload = canonical_signing_payload(
                receipt_id=receipt.receipt_id,
                action_id=receipt.action_id,
                decision=receipt.decision,
                rule_id=receipt.rule_id,
                rule_version=receipt.rule_version,
                hash_hex=receipt.hash,
                created_at_iso=receipt.created_at.isoformat(),
                public_key_id=receipt.public_key_id or "",
            )
            sig_valid = verify_receipt_signature(
                payload, receipt.signature, pub_pem
            )
        except (KeyNotConfiguredError, SignatureVerificationError):
            # Could not establish a verdict — report False rather than
            # pretending the signature is valid. AARM R5 fail-closed.
            sig_valid = False

    return ReceiptVerifyResponse(
        receipt_id=receipt.receipt_id,
        action_type=contract.action_type,
        tenant_id_prefix=contract.tenant_id[:8],
        status=receipt.decision,
        evaluated_at=receipt.created_at,
        hash=receipt.hash,
        hash_valid=(recomputed == receipt.hash),
        signature_valid=sig_valid,
        signature_alg=receipt.signature_alg,
        public_key_id=receipt.public_key_id,
        rule_ids_evaluated=rule_ids_evaluated,
    )

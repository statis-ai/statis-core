from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.receipt import Receipt
from app.schemas.receipts import ReceiptOut

router = APIRouter(tags=["receipts"])


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

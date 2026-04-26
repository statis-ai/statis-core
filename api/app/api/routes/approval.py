"""Public approval surface — token-gated.

Two endpoints, both unauthenticated. The HMAC token in `?sig=...` is the bearer
credential — possession is enough to render the page (GET) and to commit a
decision (POST). Single-use semantics enforced at the database CAS layer in
`services.approval.approve_action()`.

GET is render-only (OV5 / F1). Slack, Gmail link-preview, and Proofpoint URL
defense will prefetch the URL — issuing a side-effect on GET would burn the
token before a human ever clicked.

Every response is one of the six discriminated shapes locked in
`schemas.approval`. No untyped error bodies.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, Path, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.crypto.hmac_tokens import (
    TokenExpired,
    TokenInvalid,
    TokenPayload,
    TokenRotated,
    verify,
)
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.escalation_review import EscalationReview
from app.models.receipt import Receipt
from app.models.tenant_signing_key import TenantSigningKey
from app.schemas.actions import ActionStatus
from app.schemas.approval import (
    ActionSnapshot,
    AgentIdentitySnapshot,
    AlreadyDecidedRace,
    DecisionReceipt,
    DecisionRequest,
    ExpiredError,
    InvalidSigError,
    PendingResponse,
    RotatedError,
)
from app.services.approval import (
    ActionNotFound,
    DecisionConflict,
    DecisionInput,
    DecisionRace,
    approve_action,
)

router = APIRouter(tags=["approval"])
_log = logging.getLogger(__name__)


def _csrf_token_for(sig: str) -> str:
    """Bind a CSRF token to the URL signature (OV5).

    The token is a hash of the sig with a fixed domain separator. POST handlers
    re-derive it and `hmac.compare_digest` against the body field. No server-
    side session — anyone holding the URL can derive the same CSRF token, which
    is fine because the URL itself is the bearer credential.
    """
    return hashlib.sha256(b"statis-csrf-v1|" + sig.encode("utf-8")).hexdigest()


def _agent_snapshot_from(contract: ActionContract) -> AgentIdentitySnapshot:
    """Render the snapshot blob (or fall back to identity columns on legacy rows)."""
    snap = contract.agent_identity_snapshot or {}
    return AgentIdentitySnapshot(
        handle=snap.get("handle") or contract.proposed_by,
        version=snap.get("version"),
        spawned_by=snap.get("spawned_by"),
        actions_today=int(snap.get("actions_today") or 0),
        denied_today=int(snap.get("denied_today") or 0),
        agent_class=snap.get("agent_class") or contract.agent_class,
        org_unit=snap.get("org_unit") or contract.org_unit,
        trust_source=snap.get("trust_source") or contract.trust_source,
    )


def _decided_race_from(contract: ActionContract) -> AlreadyDecidedRace:
    receipt = (
        contract  # placeholder for type narrowing
    )
    decided_at = contract.decided_at or contract.updated_at
    decision = (
        "APPROVED"
        if contract.status in (ActionStatus.APPROVED, ActionStatus.COMPLETED, ActionStatus.EXECUTING, ActionStatus.SHADOW_COMPLETE)
        else "DENIED"
    )
    return AlreadyDecidedRace(
        action_id=contract.action_id,
        decision=decision,
        decided_at=decided_at,
        decided_by=None,
        receipt_url=f"/r/{contract.tenant_id}/{_receipt_id_for(contract)}",
    )


def _receipt_id_for(contract: ActionContract) -> str:
    """Resolve the receipt_id for an action — used to build the receipt_url.

    Receipts are 1:1 with actions and have a UNIQUE constraint on action_id.
    Returns the placeholder action_id when no receipt has been written yet
    (decision came in but the worker hasn't yet logged the execution receipt).
    """
    # Lazy local import dance — Receipt is already imported at module top.
    return contract.action_id


def _verify_token(
    db: Session, action_id: str, sig: str
) -> tuple[TokenPayload, ActionContract] | JSONResponse:
    """Resolve sig → (payload, contract) or return a typed error response.

    Order is intentional:
      1. Look up the contract by action_id (unscoped; tenant comes from the
         token claim, then verified against the contract).
      2. Look up tenant signing key.
      3. Verify HMAC + TTL + rotation.
      4. Cross-check token tenant claim == contract tenant.

    On any failure we return INVALID_SIG_ERROR (no action_id leak) per D20,
    *except* TokenExpired (benign) and TokenRotated (tenant-scoped). The
    contract lookup itself never reveals existence: an action that exists in a
    different tenant returns INVALID_SIG_ERROR, identical to the
    nonexistent case.
    """
    contract = (
        db.query(ActionContract).filter(ActionContract.action_id == action_id).first()
    )
    if contract is None:
        return _json(InvalidSigError())

    key_row = (
        db.query(TenantSigningKey)
        .filter(TenantSigningKey.tenant_id == contract.tenant_id)
        .first()
    )
    if key_row is None:
        return _json(InvalidSigError())

    rotated_at_unix = int(key_row.rotated_at.timestamp())
    try:
        payload = verify(
            token=sig,
            signing_key=key_row.signing_key,
            rotated_at_unix=rotated_at_unix,
        )
    except TokenExpired:
        expired = ExpiredError(
            action_id=contract.action_id,
            expired_at=datetime.now(timezone.utc),
        )
        return _json(expired)
    except TokenRotated:
        return _json(
            RotatedError(
                tenant_id=contract.tenant_id,
                rotated_at=key_row.rotated_at,
            )
        )
    except TokenInvalid:
        return _json(InvalidSigError())

    if payload.action_id != action_id or payload.tenant_id != contract.tenant_id:
        return _json(InvalidSigError())

    return payload, contract


def _json(model) -> JSONResponse:
    """Serialize a 6-shape response model with FastAPI's JSON encoder.

    All 6 shapes are 200 OK at the HTTP layer — discrimination happens via
    the `shape` enum field. Single source of truth for clients.
    """
    return JSONResponse(content=model.model_dump(mode="json"))


@router.get("/a/{action_id}")
def render_approval_page(
    action_id: str = Path(..., min_length=1),
    sig: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Render the approval page payload. NEVER mutates state — F1/OV5."""
    resolved = _verify_token(db, action_id, sig)
    if isinstance(resolved, JSONResponse):
        return resolved
    payload, contract = resolved

    if contract.status not in (
        ActionStatus.PROPOSED,
        ActionStatus.ESCALATED,
        ActionStatus.STEP_UP,
    ):
        return _json(_decided_race_from(contract))

    proposed_at = contract.created_at
    expires_at = datetime.fromtimestamp(payload.expires_at, tz=timezone.utc)

    snapshot = ActionSnapshot(
        action_id=contract.action_id,
        tenant_id=contract.tenant_id,
        action_type=contract.action_type,
        target_system=contract.target_system,
        target_entity=contract.target_entity or {},
        parameters=contract.parameters or {},
        proposed_at=proposed_at,
        expires_at=expires_at,
        agent=_agent_snapshot_from(contract),
    )
    return _json(PendingResponse(action=snapshot))


@router.post("/a/{action_id}/decision")
def commit_decision(
    action_id: str = Path(..., min_length=1),
    sig: str = Query(..., min_length=1),
    body: DecisionRequest = Body(...),
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Apply the decision. Token + CSRF, single-use via DB CAS."""
    resolved = _verify_token(db, action_id, sig)
    if isinstance(resolved, JSONResponse):
        return resolved
    _payload, contract = resolved

    expected_csrf = _csrf_token_for(sig)
    if not hmac.compare_digest(expected_csrf, body.csrf_token):
        return _json(InvalidSigError(detail="CSRF token mismatch."))

    note: Optional[str] = body.deny_reason if body.decision == "DENIED" else None
    try:
        refreshed = approve_action(
            db,
            DecisionInput(
                action_id=action_id,
                tenant_id=contract.tenant_id,
                decision=body.decision,
                decided_by=body.decided_by,
                note=note,
                token=sig,
            ),
        )
    except ActionNotFound:
        # Should not happen — we just resolved the contract — but treat as
        # an invalid-sig leakage guard.
        return _json(InvalidSigError())
    except DecisionConflict:
        # Another decision (operator path or earlier token click) already
        # committed. Surface the receipt link.
        db.refresh(contract)
        return _json(_decided_race_from(contract))
    except DecisionRace:
        db.refresh(contract)
        return _json(_decided_race_from(contract))

    receipt = (
        db.query(Receipt).filter(Receipt.action_id == refreshed.action_id).first()
    )
    decided_at = refreshed.decided_at or datetime.now(timezone.utc)
    receipt_id = receipt.receipt_id if receipt else refreshed.action_id
    sig_alg = (receipt.signature_alg if receipt else None) or "ed25519-v1"
    public_key_id = (receipt.public_key_id if receipt else None) or "stat-ed25519-pending"

    return _json(
        DecisionReceipt(
            action_id=refreshed.action_id,
            decision=body.decision,
            decided_at=decided_at,
            decided_by=body.decided_by,
            receipt_id=receipt_id,
            receipt_url=f"/r/{refreshed.tenant_id}/{receipt_id}",
            signature_alg=sig_alg,
            public_key_id=public_key_id,
        )
    )

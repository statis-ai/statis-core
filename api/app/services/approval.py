"""Shared approve/deny flow for action contracts.

Both the operator console (`POST /actions/{id}/approve` — auth-gated) and the
public approval URL (`POST /a/{id}/decision` — token-gated) route through
`approve_action()` so the two surfaces cannot drift in their semantics. This
exists because EscalationPanel diverged once before — see Q1 in
/plan-eng-review.

What this service does
----------------------

  1. Validate the contract is in a decidable state (PROPOSED / ESCALATED /
     STEP_UP). 409 otherwise.
  2. Write an `escalation_reviews` audit row for traceability.
  3. Atomic CAS on `action_contracts`:
       UPDATE action_contracts
          SET status = $new_status,
              decided_at = now(),
              decided_via_token = $token  -- NULL for operator path
        WHERE action_id = $id
          AND decided_via_token IS NULL  -- token path: enforces single-use
        RETURNING ...
     Empty RETURNING means a sibling decision already won — caller maps to
     ALREADY_DECIDED_RACE.
  4. Returns the refreshed contract for the caller to project into the
     response shape.

What this service does NOT do
-----------------------------

  * Token verification (caller does that via app.crypto.hmac_tokens.verify).
  * Receipt writing (worker does that on execution; the decision card here
    is a forward-looking placeholder until the worker writes the real
    receipt — DecisionReceipt vs Receipt is the OV-T1 split).
  * Webhook fan-out (existing `_fire_escalation_webhooks` in routes/actions
    handles ESCALATED → APPROVED webhooks; this service emits a hook event
    via `on_decision` callback instead so it stays import-safe).
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable, Literal, Optional

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.action_contract import ActionContract
from app.models.escalation_review import EscalationReview
from app.schemas.actions import ActionStatus


DecisionLiteral = Literal["APPROVED", "DENIED"]


class DecisionConflict(Exception):
    """Action exists but is not in a decidable state. Maps to HTTP 409."""

    def __init__(self, action_id: str, current_status: str) -> None:
        super().__init__(
            f"Action '{action_id}' is in status '{current_status}', "
            "expected PROPOSED / ESCALATED / STEP_UP"
        )
        self.action_id = action_id
        self.current_status = current_status


class DecisionRace(Exception):
    """Atomic CAS lost — another decision won the race for this token."""

    def __init__(self, action_id: str) -> None:
        super().__init__(f"Action '{action_id}' was decided by a sibling request")
        self.action_id = action_id


class ActionNotFound(Exception):
    """Action not found in this tenant. Maps to HTTP 404."""

    def __init__(self, action_id: str) -> None:
        super().__init__(f"Action '{action_id}' not found")
        self.action_id = action_id


_DECIDABLE_STATUSES = (
    ActionStatus.PROPOSED,
    ActionStatus.ESCALATED,
    ActionStatus.STEP_UP,
)


@dataclass(frozen=True)
class DecisionInput:
    action_id: str
    tenant_id: str
    decision: DecisionLiteral
    decided_by: Optional[str]  # reviewer_id, free text
    note: Optional[str] = None
    token: Optional[str] = None  # NULL for operator path; populated for public URL


def approve_action(
    db: Session,
    inp: DecisionInput,
    on_decision: Optional[Callable[[ActionContract, DecisionLiteral], None]] = None,
) -> ActionContract:
    """Apply `inp.decision` to the action and return the refreshed contract.

    Raises ActionNotFound (404), DecisionConflict (409), DecisionRace (410).
    `on_decision` fires AFTER commit and is used by the caller to fan out
    side-effects (webhooks, log lines) without coupling them into this
    service.
    """
    contract = (
        db.query(ActionContract)
        .filter(
            ActionContract.action_id == inp.action_id,
            ActionContract.tenant_id == inp.tenant_id,
        )
        .first()
    )
    if contract is None:
        raise ActionNotFound(inp.action_id)
    if contract.status not in _DECIDABLE_STATUSES:
        raise DecisionConflict(inp.action_id, contract.status)

    review = EscalationReview(
        review_id=str(uuid.uuid4()),
        action_id=inp.action_id,
        reviewer_id=inp.decided_by or "anonymous",
        reviewer_decision="APPROVED" if inp.decision == "APPROVED" else "REJECTED",
        reviewer_note=inp.note,
        reviewed_at=datetime.now(timezone.utc),
    )
    db.add(review)

    now = datetime.now(timezone.utc)
    new_status = (
        ActionStatus.APPROVED if inp.decision == "APPROVED" else ActionStatus.DENIED
    )

    # Atomic CAS — first writer wins. Token path: WHERE decided_via_token IS NULL.
    # Operator path: same WHERE clause is harmless (no token was ever set).
    stmt = (
        update(ActionContract)
        .where(
            ActionContract.action_id == inp.action_id,
            ActionContract.decided_via_token.is_(None),
        )
        .values(
            status=new_status,
            decided_at=now,
            updated_at=now,
            decided_via_token=inp.token,
        )
        .returning(ActionContract.action_id)
    )
    result = db.execute(stmt).first()
    if result is None:
        # Another decision (token or operator) committed first. Caller maps to
        # ALREADY_DECIDED_RACE shape and shows the receipt link.
        db.rollback()
        raise DecisionRace(inp.action_id)

    db.commit()
    db.refresh(contract)

    if on_decision is not None:
        try:
            on_decision(contract, inp.decision)
        except Exception:
            # Side-effect failures must never poison the decision write.
            pass

    return contract

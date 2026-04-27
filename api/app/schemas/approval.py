"""Pydantic contracts for the public approval surface.

Locks the 6-response-shape contract from /plan-eng-review (A5). Both the
approval page (GET /a/{action_id}?sig=...) and the decision endpoint
(POST /a/{action_id}/decision) return one of these shapes. Every other
state — pending, approved, denied, expired, bad signature, rotated key,
race — is represented exactly once.

Lane 3a (approval page) and Lane 3b (receipts page) consume these shapes
for type-safe rendering on the Next.js side; openapi.json codegen turns
them into TypeScript at build time.

Six shapes
----------

  PENDING                     GET /a/{id} with valid token, action awaiting decision
  DECISION_RECEIPT            POST /a/{id}/decision succeeded, returns minimal receipt-card
  EXPIRED_ERROR               token's `exp` < now (recoverable: request a new link)
  INVALID_SIG_ERROR           HMAC mismatch, malformed token, or unknown tenant (no
                              action_id leak; cautionary copy per D20)
  ROTATED_ERROR               token's `iat` < tenant.rotated_at — the secret was
                              rotated, all outstanding tokens are dead
  ALREADY_DECIDED_RACE        token verified, but actions.decided_via_token is
                              already set (someone else just clicked) — inline
                              banner per D32, links to the receipt
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field


class ApprovalShape(str, Enum):
    PENDING = "PENDING"
    DECISION_RECEIPT = "DECISION_RECEIPT"
    EXPIRED_ERROR = "EXPIRED_ERROR"
    INVALID_SIG_ERROR = "INVALID_SIG_ERROR"
    ROTATED_ERROR = "ROTATED_ERROR"
    ALREADY_DECIDED_RACE = "ALREADY_DECIDED_RACE"


class AgentIdentitySnapshot(BaseModel):
    """Frozen agent identity at propose time. Snapshot, not a live join (OV-T2)."""

    handle: str
    version: Optional[str] = None
    spawned_by: Optional[str] = None
    actions_today: int = 0
    denied_today: int = 0
    agent_class: Optional[str] = None  # AARM R6 layer 2
    org_unit: Optional[str] = None  # AARM R6 layer 3
    trust_source: Optional[str] = None  # AARM R6 layer 4


class ActionSnapshot(BaseModel):
    """Frozen action state shown on the approval page."""

    action_id: str
    tenant_id: str
    action_type: str
    target_system: str
    target_entity: dict[str, Any]
    parameters: dict[str, Any]
    proposed_at: datetime
    expires_at: datetime  # token expiry, NOT action expiry
    agent: AgentIdentitySnapshot


class PendingResponse(BaseModel):
    shape: Literal[ApprovalShape.PENDING] = ApprovalShape.PENDING
    action: ActionSnapshot


class DecisionReceipt(BaseModel):
    """The in-place morph target per OV-T1.

    Lazy-loads `execution_result` on the receipts page; this card just
    confirms decision + receipt_id + signing metadata.
    """

    shape: Literal[ApprovalShape.DECISION_RECEIPT] = ApprovalShape.DECISION_RECEIPT
    action_id: str
    decision: Literal["APPROVED", "DENIED"]
    decided_at: datetime
    decided_by: Optional[str] = None  # reviewer_id, free text
    receipt_id: str
    receipt_url: str  # /r/{tenant_id}/{receipt_id}
    signature_alg: str
    public_key_id: str


class ExpiredError(BaseModel):
    shape: Literal[ApprovalShape.EXPIRED_ERROR] = ApprovalShape.EXPIRED_ERROR
    action_id: str  # OK to leak; expiry is benign
    expired_at: datetime
    recovery_hint: str = "Ask the agent to re-issue the request."


class InvalidSigError(BaseModel):
    """No action_id surfaced. Cautionary copy per D20."""

    shape: Literal[ApprovalShape.INVALID_SIG_ERROR] = ApprovalShape.INVALID_SIG_ERROR
    detail: str = Field(default="Token is invalid or tampered with.")


class RotatedError(BaseModel):
    shape: Literal[ApprovalShape.ROTATED_ERROR] = ApprovalShape.ROTATED_ERROR
    tenant_id: str
    rotated_at: datetime
    detail: str = Field(
        default="The tenant signing key was rotated; this link is no longer valid."
    )


class AlreadyDecidedRace(BaseModel):
    shape: Literal[ApprovalShape.ALREADY_DECIDED_RACE] = ApprovalShape.ALREADY_DECIDED_RACE
    action_id: str
    decision: Literal["APPROVED", "DENIED"]
    decided_at: datetime
    decided_by: Optional[str] = None
    receipt_url: str


# Unions for FastAPI response models. Discriminated on `shape`.
ApprovalGetResponse = Union[
    PendingResponse,
    ExpiredError,
    InvalidSigError,
    RotatedError,
    AlreadyDecidedRace,
]


ApprovalDecisionResponse = Union[
    DecisionReceipt,
    ExpiredError,
    InvalidSigError,
    RotatedError,
    AlreadyDecidedRace,
]


class DecisionRequest(BaseModel):
    """POST /a/{action_id}/decision body. CSRF token bound to sig (OV5)."""

    decision: Literal["APPROVED", "DENIED"]
    csrf_token: str
    decided_by: Optional[str] = None  # free-text reviewer label
    deny_reason: Optional[str] = None

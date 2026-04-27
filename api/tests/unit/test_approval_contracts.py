"""Spine — round-trip the 6 response shapes and the request body.

Each shape must serialize/deserialize cleanly so OpenAPI codegen produces
matching TypeScript types for Lane 3a / 3b consumers.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from app.schemas.approval import (
    ActionSnapshot,
    AgentIdentitySnapshot,
    AlreadyDecidedRace,
    ApprovalShape,
    DecisionReceipt,
    DecisionRequest,
    ExpiredError,
    InvalidSigError,
    PendingResponse,
    RotatedError,
)


def _agent() -> AgentIdentitySnapshot:
    return AgentIdentitySnapshot(
        handle="billing-bot",
        version="v3.2.1",
        spawned_by="deploys/v0.4.0",
        actions_today=14,
        denied_today=0,
        agent_class="capability:retention",
        org_unit="cs/retention",
        trust_source="api_key",
    )


def _action() -> ActionSnapshot:
    now = datetime.now(timezone.utc)
    return ActionSnapshot(
        action_id="statis-abc",
        tenant_id="tnt_a",
        action_type="apply_discount",
        target_system="stripe",
        target_entity={"customer_id": "cus_42"},
        parameters={"amount": 1500, "reason": "retention"},
        proposed_at=now,
        expires_at=now + timedelta(minutes=30),
        agent=_agent(),
    )


def test_pending_round_trip() -> None:
    p = PendingResponse(action=_action())
    raw = p.model_dump(mode="json")
    assert raw["shape"] == ApprovalShape.PENDING.value
    again = PendingResponse.model_validate(raw)
    assert again.action.action_id == "statis-abc"


def test_decision_receipt_shape() -> None:
    now = datetime.now(timezone.utc)
    r = DecisionReceipt(
        action_id="statis-abc",
        decision="APPROVED",
        decided_at=now,
        decided_by="alice@example.com",
        receipt_id="rcpt_1",
        receipt_url="/r/tnt_a/rcpt_1",
        signature_alg="ed25519-v1",
        public_key_id="stat-ed25519-dev",
    )
    raw = r.model_dump(mode="json")
    assert raw["shape"] == ApprovalShape.DECISION_RECEIPT.value
    assert raw["decision"] == "APPROVED"


def test_invalid_sig_omits_action_id() -> None:
    """D20 — INVALID_SIG must not leak action_id."""
    err = InvalidSigError()
    raw = err.model_dump(mode="json")
    assert "action_id" not in raw
    assert raw["shape"] == ApprovalShape.INVALID_SIG_ERROR.value


def test_expired_error_includes_action_id() -> None:
    """D20 — EXPIRED can leak action_id; expiry is benign."""
    now = datetime.now(timezone.utc)
    err = ExpiredError(action_id="statis-abc", expired_at=now)
    raw = err.model_dump(mode="json")
    assert raw["action_id"] == "statis-abc"
    assert raw["shape"] == ApprovalShape.EXPIRED_ERROR.value


def test_rotated_error_round_trip() -> None:
    now = datetime.now(timezone.utc)
    err = RotatedError(tenant_id="tnt_a", rotated_at=now)
    raw = err.model_dump(mode="json")
    assert raw["tenant_id"] == "tnt_a"
    assert raw["shape"] == ApprovalShape.ROTATED_ERROR.value


def test_already_decided_race_includes_receipt_url() -> None:
    """D32 — race banner links to the winning receipt."""
    now = datetime.now(timezone.utc)
    race = AlreadyDecidedRace(
        action_id="statis-abc",
        decision="DENIED",
        decided_at=now,
        decided_by="bob@example.com",
        receipt_url="/r/tnt_a/rcpt_2",
    )
    raw = race.model_dump(mode="json")
    assert raw["receipt_url"] == "/r/tnt_a/rcpt_2"
    assert raw["shape"] == ApprovalShape.ALREADY_DECIDED_RACE.value


def test_decision_request_requires_csrf_token() -> None:
    """OV5 — POST body must carry CSRF token bound to sig."""
    with pytest.raises(Exception):
        DecisionRequest(decision="APPROVED")  # type: ignore[call-arg]


def test_decision_request_round_trip() -> None:
    req = DecisionRequest(
        decision="APPROVED",
        csrf_token="csrf_abc",
        decided_by="alice@example.com",
    )
    raw = req.model_dump(mode="json")
    again = DecisionRequest.model_validate(raw)
    assert again.decision == "APPROVED"
    assert again.csrf_token == "csrf_abc"


def test_decision_request_rejects_unknown_decision() -> None:
    with pytest.raises(Exception):
        DecisionRequest(decision="MAYBE", csrf_token="x")  # type: ignore[arg-type]


def test_shape_field_is_discriminator() -> None:
    """Every response shape carries an enum-typed `shape` field."""
    samples = [
        PendingResponse(action=_action()),
        InvalidSigError(),
        ExpiredError(action_id="a", expired_at=datetime.now(timezone.utc)),
        RotatedError(tenant_id="t", rotated_at=datetime.now(timezone.utc)),
    ]
    shapes = {s.shape for s in samples}
    assert ApprovalShape.PENDING in shapes
    assert ApprovalShape.INVALID_SIG_ERROR in shapes
    assert ApprovalShape.EXPIRED_ERROR in shapes
    assert ApprovalShape.ROTATED_ERROR in shapes

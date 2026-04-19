"""AARM R1 conformance — pre-execution interception (Context-Allow Class).

Spec reference: arxiv:2602.09433 §VII.B.R1.

R1: "Every autonomous action MUST be intercepted before execution and
evaluated against policy. Execution without an explicit ALLOW from the
Context-Allow Class is a direct R1 violation."

These tests cover the worker's last-line-of-defense gate
(``pre_execute_check``) which re-verifies receipt existence, decision
class, and signature validity right before the adapter is called.
This guards against DB-level tampering and bypass bugs that skip the
policy evaluator entirely.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from app.security.r1_gate import (
    ALLOW_DECISIONS,
    PreExecuteCheck,
    pre_execute_check,
)


def _make_action(action_id: str = "act-1") -> MagicMock:
    a = MagicMock()
    a.action_id = action_id
    a.tenant_id = "t1"
    a.action_type = "send_email"
    a.target_system = "email"
    return a


def _make_receipt(
    decision: str = "APPROVED",
    signature: str | None = None,
    signature_alg: str | None = None,
    public_key_id: str | None = None,
) -> MagicMock:
    r = MagicMock()
    r.receipt_id = "rcp-1"
    r.action_id = "act-1"
    r.decision = decision
    r.rule_id = "rule-x"
    r.rule_version = "1"
    r.hash = "a" * 64
    r.created_at = datetime(2026, 4, 19, tzinfo=timezone.utc)
    r.signature = signature
    r.signature_alg = signature_alg
    r.public_key_id = public_key_id
    return r


# ---------------------------------------------------------------------------
# ALLOW_DECISIONS taxonomy
# ---------------------------------------------------------------------------


class TestR1AllowDecisions:
    """Only APPROVED/ALLOW-class decisions may reach adapter dispatch.

    Per AARM R4, MODIFY also dispatches (as patched parameters under an
    APPROVED contract.status) so it belongs in the allow set.
    """

    def test_r1_approved_in_allow_set(self) -> None:
        assert "APPROVED" in ALLOW_DECISIONS

    def test_r1_modified_in_allow_set(self) -> None:
        assert "MODIFIED" in ALLOW_DECISIONS

    def test_r1_denied_not_in_allow_set(self) -> None:
        assert "DENIED" not in ALLOW_DECISIONS

    def test_r1_deferred_not_in_allow_set(self) -> None:
        """AARM R1/R4: 'no effects MUST occur on denied or deferred actions'."""
        assert "DEFERRED" not in ALLOW_DECISIONS

    def test_r1_step_up_not_in_allow_set(self) -> None:
        """STEP_UP awaits human review — it MUST NOT self-dispatch."""
        assert "STEP_UP" not in ALLOW_DECISIONS
        assert "ESCALATED" not in ALLOW_DECISIONS


# ---------------------------------------------------------------------------
# Gate behaviour — receipt existence + decision class
# ---------------------------------------------------------------------------


class TestR1GateBasic:
    def test_r1_gate_passes_on_approved_unsigned_receipt(self) -> None:
        """Dev-mode: unsigned receipt with APPROVED decision → dispatch OK.
        Production MUST set require_signature=True to enforce R5."""
        result = pre_execute_check(_make_action(), _make_receipt("APPROVED"))
        assert result.ok is True
        assert result.reason == "ok"

    def test_r1_gate_passes_on_modified_unsigned_receipt(self) -> None:
        """A MODIFIED receipt represents a patched-but-approved dispatch."""
        result = pre_execute_check(_make_action(), _make_receipt("MODIFIED"))
        assert result.ok is True

    def test_r1_gate_refuses_missing_receipt(self) -> None:
        """No receipt → R1 violation. The action cannot have been
        intercepted because no evidence of interception exists."""
        result = pre_execute_check(_make_action(), None)
        assert result.ok is False
        assert result.reason == "no_receipt"

    def test_r1_gate_refuses_denied_receipt(self) -> None:
        result = pre_execute_check(_make_action(), _make_receipt("DENIED"))
        assert result.ok is False
        assert result.reason == "decision_not_allow:DENIED"

    def test_r1_gate_refuses_deferred_receipt(self) -> None:
        """AARM R4: deferred actions must not dispatch even if status was
        somehow flipped to APPROVED at the contract level."""
        result = pre_execute_check(_make_action(), _make_receipt("DEFERRED"))
        assert result.ok is False
        assert result.reason == "decision_not_allow:DEFERRED"

    def test_r1_gate_refuses_step_up_receipt(self) -> None:
        """A human-review-only decision can never self-dispatch."""
        result = pre_execute_check(_make_action(), _make_receipt("STEP_UP"))
        assert result.ok is False

    def test_r1_gate_refuses_escalated_receipt(self) -> None:
        """Legacy ESCALATED is equivalent to STEP_UP — blocked identically."""
        result = pre_execute_check(_make_action(), _make_receipt("ESCALATED"))
        assert result.ok is False


# ---------------------------------------------------------------------------
# require_signature — prod enforcement mode
# ---------------------------------------------------------------------------


class TestR1RequireSignature:
    def test_r1_strict_mode_refuses_unsigned(self) -> None:
        """require_signature=True refuses unsigned receipts outright.
        AARM R5 says production MUST sign every receipt; an unsigned
        receipt in strict mode is both an R5 and an R1 violation."""
        result = pre_execute_check(
            _make_action(),
            _make_receipt("APPROVED", signature=None),
            require_signature=True,
        )
        assert result.ok is False
        assert result.reason == "signature_required"

    def test_r1_strict_mode_passes_on_valid_signed_receipt(self) -> None:
        """A receipt with a valid signature verifies and passes in strict mode."""
        receipt = _make_receipt(
            "APPROVED",
            signature="AA" * 32,
            signature_alg="Ed25519",
            public_key_id="kid-1",
        )
        with patch(
            "app.security.r1_gate.active_public_key_pem", return_value="PEM"
        ), patch(
            "app.security.r1_gate.verify_receipt_signature", return_value=True
        ), patch(
            "app.security.r1_gate.canonical_signing_payload",
            return_value=MagicMock(),
        ):
            result = pre_execute_check(
                _make_action(), receipt, require_signature=True
            )
        assert result.ok is True


# ---------------------------------------------------------------------------
# Signature verification — tamper detection
# ---------------------------------------------------------------------------


class TestR1SignatureVerification:
    def test_r1_invalid_signature_refuses(self) -> None:
        """Invalid signature → R1 rejection. This is the tamper-detection
        branch — if someone flipped the decision column from DENIED to
        APPROVED, the original signature no longer verifies against the
        new canonical payload."""
        receipt = _make_receipt(
            "APPROVED",
            signature="AA" * 32,
            signature_alg="Ed25519",
            public_key_id="kid-1",
        )
        with patch(
            "app.security.r1_gate.active_public_key_pem", return_value="PEM"
        ), patch(
            "app.security.r1_gate.verify_receipt_signature", return_value=False
        ), patch(
            "app.security.r1_gate.canonical_signing_payload",
            return_value=MagicMock(),
        ):
            result = pre_execute_check(_make_action(), receipt)
        assert result.ok is False
        assert result.reason == "signature_invalid"

    def test_r1_key_not_configured_refuses(self) -> None:
        """If the signing key cannot be loaded we can't establish a
        verdict — AARM fail-closed: refuse dispatch."""
        from app.crypto import KeyNotConfiguredError

        receipt = _make_receipt(
            "APPROVED",
            signature="AA" * 32,
            signature_alg="Ed25519",
            public_key_id="kid-1",
        )
        with patch(
            "app.security.r1_gate.active_public_key_pem",
            side_effect=KeyNotConfiguredError("no key"),
        ):
            result = pre_execute_check(_make_action(), receipt)
        assert result.ok is False
        assert result.reason == "signature_unverifiable"

    def test_r1_malformed_signature_refuses(self) -> None:
        """A receipt with a corrupted signature → fail-closed."""
        from app.crypto import SignatureVerificationError

        receipt = _make_receipt(
            "APPROVED",
            signature="not-valid-base64",
            signature_alg="Ed25519",
            public_key_id="kid-1",
        )
        with patch(
            "app.security.r1_gate.active_public_key_pem", return_value="PEM"
        ), patch(
            "app.security.r1_gate.canonical_signing_payload",
            return_value=MagicMock(),
        ), patch(
            "app.security.r1_gate.verify_receipt_signature",
            side_effect=SignatureVerificationError("bad b64"),
        ):
            result = pre_execute_check(_make_action(), receipt)
        assert result.ok is False
        assert result.reason == "signature_unverifiable"

    def test_r1_tamper_detection_decision_flipped_from_denied(self) -> None:
        """End-to-end tamper scenario: receipt was signed for DECISION=DENIED
        but the decision column was flipped to APPROVED in the DB.
        Verification against the *current* canonical payload will fail
        because the signature covers the original DENIED decision."""
        # Simulate a tampered receipt — decision says APPROVED but the
        # signature (conceptually) was computed over a different decision.
        receipt = _make_receipt(
            "APPROVED",  # the flipped value
            signature="AA" * 32,  # still the old signature
            signature_alg="Ed25519",
            public_key_id="kid-1",
        )
        with patch(
            "app.security.r1_gate.active_public_key_pem", return_value="PEM"
        ), patch(
            "app.security.r1_gate.verify_receipt_signature", return_value=False
        ), patch(
            "app.security.r1_gate.canonical_signing_payload",
            return_value=MagicMock(),
        ):
            result = pre_execute_check(_make_action(), receipt)
        # The gate MUST refuse — this is the core R1 guarantee.
        assert result.ok is False
        assert result.reason == "signature_invalid"


# ---------------------------------------------------------------------------
# Return shape
# ---------------------------------------------------------------------------


class TestR1GateShape:
    def test_r1_returns_preexecute_check_dataclass(self) -> None:
        result = pre_execute_check(_make_action(), _make_receipt())
        assert isinstance(result, PreExecuteCheck)
        assert isinstance(result.ok, bool)
        assert isinstance(result.reason, str)

    def test_r1_preexecute_check_is_frozen(self) -> None:
        """The result is immutable — auditors can be confident the gate
        verdict cannot be mutated after the fact."""
        result = pre_execute_check(_make_action(), _make_receipt())
        with pytest.raises(Exception):
            result.ok = False  # type: ignore[misc]

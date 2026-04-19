"""AARM R1 — pre-execution interception (Context-Allow Class).

Spec reference: arxiv:2602.09433 §VII.B.R1.

R1 requires: "Every autonomous action MUST be intercepted before
execution and evaluated against policy. Execution without an explicit
ALLOW from the Context-Allow Class is a direct R1 violation."

This module provides the *last line of defense* — a pure gate function
the worker calls immediately before dispatching an action to its
adapter. Even if a malicious or buggy code path flipped
``action_contracts.status`` to ``APPROVED`` without writing a receipt,
the gate refuses to dispatch.

Checks, in order:
  1. A receipt row exists for the action.
  2. The receipt's decision is in the ALLOW set (APPROVED or MODIFIED;
     MODIFIED dispatches the patched parameters under an APPROVED status
     per AARM R4, but the receipt.decision preserves the MODIFY audit).
  3. If the receipt carries an Ed25519 signature, the signature verifies
     against the currently-active public key. Unsigned receipts pass the
     gate in dev (so the stack runs without STATIS_SIGNING_PRIVATE_KEY)
     but production MUST set the key and require signatures — failure
     here is an R5/R1 joint violation.

The gate returns a structured result rather than raising so the worker
can record an auditable FAILED-reason receipt for each refusal.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.crypto import (
    KeyNotConfiguredError,
    SignatureVerificationError,
    active_public_key_pem,
    canonical_signing_payload,
    verify_receipt_signature,
)


# Receipt decisions that authorize the worker to dispatch.
# MODIFIED is included because AARM R4 MODIFY dispatches the patched
# parameters under an APPROVED contract.status while the receipt preserves
# the "MODIFIED" decision for audit trail.
ALLOW_DECISIONS: frozenset[str] = frozenset({"APPROVED", "MODIFIED"})


@dataclass(frozen=True)
class PreExecuteCheck:
    """Result of the R1 pre-execution gate.

    ``ok=True`` means the worker is cleared to call ``adapter.execute``.
    Any ``ok=False`` result MUST abort dispatch; ``reason`` names the
    violation class for the receipt/audit log.
    """

    ok: bool
    reason: str  # "ok" | "no_receipt" | "decision_not_allow:<value>" | "signature_invalid" | "signature_unverifiable"


def pre_execute_check(
    action: Any,
    receipt: Any,
    *,
    require_signature: bool = False,
) -> PreExecuteCheck:
    """AARM R1 gate — must return ok=True before any adapter is called.

    ``receipt`` may be ``None`` if the caller did not join/load one;
    this function treats that as the top-priority violation.

    ``require_signature=True`` enforces AARM R5 alongside R1 — a missing
    signature becomes a rejection rather than a pass. Production
    deployments MUST set this to True; development environments may
    leave it False to run without configuring an Ed25519 key.
    """
    if receipt is None:
        return PreExecuteCheck(ok=False, reason="no_receipt")

    decision = getattr(receipt, "decision", None)
    if decision not in ALLOW_DECISIONS:
        return PreExecuteCheck(
            ok=False, reason=f"decision_not_allow:{decision}"
        )

    signature = getattr(receipt, "signature", None)
    signature_alg = getattr(receipt, "signature_alg", None)
    if signature is None or signature_alg is None:
        if require_signature:
            return PreExecuteCheck(ok=False, reason="signature_required")
        return PreExecuteCheck(ok=True, reason="ok")

    # Verify the Ed25519 signature against the active public key.
    # A tampered receipt (e.g. someone flipped decision from DENIED to
    # APPROVED in the DB) will fail verification and be refused.
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
        verified = verify_receipt_signature(payload, signature, pub_pem)
    except (KeyNotConfiguredError, SignatureVerificationError):
        # Can't establish a verdict — AARM fail-closed: refuse.
        return PreExecuteCheck(ok=False, reason="signature_unverifiable")

    if not verified:
        return PreExecuteCheck(ok=False, reason="signature_invalid")

    return PreExecuteCheck(ok=True, reason="ok")

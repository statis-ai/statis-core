"""Ed25519 receipt verification helpers for the Python SDK.

Used by ``StatisClient.verify_receipt()`` to check that a fetched
receipt's Ed25519 signature validates against the public key served by
the API's ``/.well-known/aarm-pubkey`` endpoint.

Clients can call ``verify_receipt_offline(receipt, pubkey_pem)`` once
they've cached the public key PEM, so verification needs zero further
network calls and no authentication.

AARM R5 (arxiv:2602.09433 §VII.B.R5) — "Public keys available for
offline verification".
"""
from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any, Optional


SIGNING_SCHEMA_VERSION = 1


@dataclass(frozen=True)
class VerifyResult:
    valid: bool
    reason: Optional[str] = None


def _b64u_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _canonical_bytes(
    *,
    receipt_id: str,
    action_id: str,
    decision: str,
    rule_id: Optional[str],
    rule_version: Optional[str],
    hash_hex: str,
    created_at_iso: str,
    public_key_id: str,
) -> bytes:
    payload: dict[str, Any] = {
        "v": SIGNING_SCHEMA_VERSION,
        "receipt_id": receipt_id,
        "action_id": action_id,
        "decision": decision,
        "rule_id": rule_id,
        "rule_version": rule_version,
        "hash": hash_hex,
        "created_at": created_at_iso,
        "public_key_id": public_key_id,
    }
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode(
        "utf-8"
    )


def verify_receipt_offline(
    *,
    receipt: Any,
    public_key_pem: str,
) -> VerifyResult:
    """Verify a Receipt dataclass against a PEM-encoded Ed25519 public key.

    ``receipt`` is the statis.Receipt dataclass returned by the SDK; it
    must expose receipt_id, action_id, decision, rule_id, rule_version,
    hash, created_at (datetime), and the PR-AARM-02 additions signature,
    signature_alg, public_key_id.

    Returns ``VerifyResult(valid=True)`` on success. Never raises on a
    mismatch — returns ``VerifyResult(valid=False, reason=...)`` so SDK
    users can handle it without a try/except.
    """
    try:
        from cryptography.exceptions import InvalidSignature  # noqa: F401
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric.ed25519 import (
            Ed25519PublicKey,
        )
    except ImportError:
        return VerifyResult(
            valid=False,
            reason=(
                "cryptography is not installed. "
                "pip install 'statis-ai[verify]' to enable offline receipt "
                "verification."
            ),
        )

    sig_b64 = getattr(receipt, "signature", None)
    sig_alg = getattr(receipt, "signature_alg", None)
    pkid = getattr(receipt, "public_key_id", None) or ""

    if not sig_b64 or not sig_alg:
        return VerifyResult(
            valid=False,
            reason="Receipt has no Ed25519 signature (legacy or unsigned).",
        )
    if not sig_alg.startswith("ed25519"):
        return VerifyResult(
            valid=False,
            reason=f"Unsupported signature algorithm: {sig_alg}",
        )

    try:
        pub = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
    except Exception as exc:
        return VerifyResult(
            valid=False, reason=f"Could not load public key PEM: {exc}"
        )
    if not isinstance(pub, Ed25519PublicKey):
        return VerifyResult(
            valid=False, reason="Public key is not Ed25519"
        )

    try:
        sig = _b64u_decode(sig_b64)
    except Exception as exc:
        return VerifyResult(
            valid=False, reason=f"Signature is not valid base64url: {exc}"
        )

    created_at_iso = (
        receipt.created_at.isoformat()
        if hasattr(receipt.created_at, "isoformat")
        else str(receipt.created_at)
    )

    message = _canonical_bytes(
        receipt_id=receipt.receipt_id,
        action_id=receipt.action_id,
        decision=receipt.decision,
        rule_id=receipt.rule_id,
        rule_version=receipt.rule_version,
        hash_hex=receipt.hash,
        created_at_iso=created_at_iso,
        public_key_id=pkid,
    )

    from cryptography.exceptions import InvalidSignature

    try:
        pub.verify(sig, message)
    except InvalidSignature:
        return VerifyResult(valid=False, reason="Signature does not match")
    return VerifyResult(valid=True)

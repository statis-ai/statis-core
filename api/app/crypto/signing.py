"""Ed25519 receipt signing — AARM R5 implementation.

Receipts carry three fields after this module is wired in:
  * hash            — SHA-256 of canonical receipt state (unchanged; used
                      by the existing /receipts/{id}/verify hash path).
  * signature       — base64url-encoded Ed25519 signature over the
                      canonical signing payload.
  * signature_alg   — "ed25519-v1" for receipts signed by this module.
  * public_key_id   — stable identifier of the keypair that signed it.

The canonical signing payload is NOT just the hash. It is a structured
dict (sort-key, compact JSON) that includes the hash plus identity and
decision fields, so a receipt is tamper-evident even if the hash itself
were wrong or regenerated. Signing schema version is pinned via the "v"
field.

Keys are loaded from environment:
  STATIS_SIGNING_PRIVATE_KEY   Ed25519 private key in PKCS#8 PEM.
                               Multi-line value; use base64-wrapped PEM.
  STATIS_SIGNING_PUBLIC_KEY    Ed25519 public key in SubjectPublicKeyInfo
                               PEM. Optional — derived from private key
                               when not set.
  STATIS_SIGNING_KEY_ID        Stable identifier shown in receipts and the
                               /.well-known/aarm-pubkey endpoint.
                               Defaults to "stat-ed25519-dev".

Key rotation (active + retired) is out of scope for PR-AARM-02 and will
land in a follow-up PR. The /.well-known endpoint ships the "keys" array
shape from day one so future rotation does not break clients.
"""
from __future__ import annotations

import base64
import json
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)


SIGNATURE_ALG = "ed25519-v1"
SIGNING_SCHEMA_VERSION = 1
DEFAULT_KEY_ID = "stat-ed25519-dev"


class KeyNotConfiguredError(RuntimeError):
    """STATIS_SIGNING_PRIVATE_KEY missing or malformed at startup."""


class SignatureVerificationError(RuntimeError):
    """Signature failed to verify against the provided public key."""


@dataclass(frozen=True)
class CanonicalPayload:
    """Exact bytes that get signed / verified for a receipt.

    Two receipts with the same canonical payload MUST produce identical
    signatures — this is what lets third parties verify offline.
    """

    bytes_: bytes
    as_dict: dict[str, Any]


def get_active_key_id() -> str:
    return os.environ.get("STATIS_SIGNING_KEY_ID", DEFAULT_KEY_ID)


@lru_cache(maxsize=1)
def load_active_keypair() -> tuple[Ed25519PrivateKey, Ed25519PublicKey]:
    """Load the active signing keypair from environment.

    Cached — keys are immutable for the process lifetime. Tests that need
    a fresh key must call ``load_active_keypair.cache_clear()``.
    """
    priv_pem = os.environ.get("STATIS_SIGNING_PRIVATE_KEY")
    if not priv_pem:
        raise KeyNotConfiguredError(
            "STATIS_SIGNING_PRIVATE_KEY is not set. Generate a keypair with "
            "`make keygen` and set it in your environment before signing "
            "receipts. (See docs/aarm/signing.md when the landing page for "
            "AARM lands in PR-AARM-10.)"
        )
    try:
        private_key = serialization.load_pem_private_key(
            priv_pem.encode("utf-8"), password=None
        )
    except Exception as exc:  # pragma: no cover — surface clearly at boot
        raise KeyNotConfiguredError(
            f"STATIS_SIGNING_PRIVATE_KEY could not be parsed as PEM: {exc}"
        ) from exc

    if not isinstance(private_key, Ed25519PrivateKey):
        raise KeyNotConfiguredError(
            "STATIS_SIGNING_PRIVATE_KEY is not an Ed25519 key. AARM R5 allows "
            "Ed25519, ECDSA P-256, or RSA-2048; this implementation uses "
            "Ed25519 exclusively in v1."
        )

    public_key = private_key.public_key()
    return private_key, public_key


def active_public_key_pem() -> str:
    """Return the active public key serialized as SubjectPublicKeyInfo PEM."""
    _, pub = load_active_keypair()
    pem_bytes = pub.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return pem_bytes.decode("utf-8")


def generate_keypair_pem() -> tuple[str, str]:
    """Generate a fresh Ed25519 keypair and return (private_pem, public_pem).

    Used by the `make keygen` helper and by tests. Not called from app
    code at runtime.
    """
    priv = Ed25519PrivateKey.generate()
    priv_pem = priv.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_pem = priv.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return priv_pem.decode("utf-8"), pub_pem.decode("utf-8")


def canonical_signing_payload(
    *,
    receipt_id: str,
    action_id: str,
    decision: str,
    rule_id: str | None,
    rule_version: str | None,
    hash_hex: str,
    created_at_iso: str,
    public_key_id: str,
) -> CanonicalPayload:
    """Build the exact bytes that Ed25519 will sign / verify.

    Sort-key, compact JSON — identical across implementations as long as
    the inputs match. Keep this function's signature stable; any change
    breaks verification of historical receipts.
    """
    as_dict: dict[str, Any] = {
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
    encoded = json.dumps(as_dict, sort_keys=True, separators=(",", ":")).encode(
        "utf-8"
    )
    return CanonicalPayload(bytes_=encoded, as_dict=as_dict)


def _b64u_encode(b: bytes) -> str:
    """URL-safe base64 without padding — compact and URL-embeddable."""
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def _b64u_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def sign_receipt_payload(payload: CanonicalPayload) -> str:
    """Sign the canonical payload with the active Ed25519 private key."""
    priv, _ = load_active_keypair()
    sig = priv.sign(payload.bytes_)
    return _b64u_encode(sig)


def verify_receipt_signature(
    payload: CanonicalPayload, signature_b64u: str, public_key_pem: str
) -> bool:
    """Verify a signature against the provided public key.

    Accepts any PEM-encoded Ed25519 public key (e.g. the one served by
    /.well-known/aarm-pubkey), not just the active one. This lets the
    verify endpoint check historical receipts signed by retired keys
    once rotation lands.

    Returns True on success, False on mismatch. Raises on malformed input.
    """
    try:
        pub = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
    except Exception as exc:  # pragma: no cover
        raise SignatureVerificationError(
            f"Could not load public key PEM: {exc}"
        ) from exc

    if not isinstance(pub, Ed25519PublicKey):
        raise SignatureVerificationError(
            "Public key is not Ed25519; cannot verify"
        )

    try:
        sig = _b64u_decode(signature_b64u)
    except Exception as exc:
        raise SignatureVerificationError(
            f"Signature is not valid base64url: {exc}"
        ) from exc

    try:
        pub.verify(sig, payload.bytes_)
    except InvalidSignature:
        return False
    return True

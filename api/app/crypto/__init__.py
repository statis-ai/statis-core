"""Cryptographic primitives for Statis receipts (AARM R5)."""

from app.crypto.signing import (
    DEFAULT_KEY_ID,
    SIGNATURE_ALG,
    SIGNING_SCHEMA_VERSION,
    CanonicalPayload,
    KeyNotConfiguredError,
    SignatureVerificationError,
    active_public_key_pem,
    canonical_signing_payload,
    generate_keypair_pem,
    get_active_key_id,
    load_active_keypair,
    sign_receipt_payload,
    verify_receipt_signature,
)

__all__ = [
    "DEFAULT_KEY_ID",
    "SIGNATURE_ALG",
    "SIGNING_SCHEMA_VERSION",
    "CanonicalPayload",
    "KeyNotConfiguredError",
    "SignatureVerificationError",
    "active_public_key_pem",
    "canonical_signing_payload",
    "generate_keypair_pem",
    "get_active_key_id",
    "load_active_keypair",
    "sign_receipt_payload",
    "verify_receipt_signature",
]

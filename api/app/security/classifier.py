"""AARM R2 — Data classification for context log entries.

Every field flowing through the context channel is classified into one of
five sensitivity classes at propose-time. The classification is stored
alongside a hash of the value in the append-only context log, so auditors
can verify what *kind* of data influenced a decision without re-exposing
the raw values.

Spec reference: arxiv:2602.09433 §VII.B.R2 (Context Accumulation).
"""
from __future__ import annotations

import re
from typing import Any

# ---------------------------------------------------------------------------
# 5-class AARM R2 sensitivity taxonomy
# ---------------------------------------------------------------------------

PUBLIC = "PUBLIC"        # safe to share externally
INTERNAL = "INTERNAL"    # default — safe within the tenant boundary
PII = "PII"              # personally identifiable information
SECRET = "SECRET"        # credentials, tokens, keys
SYSTEM = "SYSTEM"        # platform-set fields (agent_id, tenant_id, meta)

CLASSIFICATIONS: frozenset[str] = frozenset({PUBLIC, INTERNAL, PII, SECRET, SYSTEM})


# ---------------------------------------------------------------------------
# Field-name taxonomies (case-insensitive)
# ---------------------------------------------------------------------------

_SECRET_KEY_EXACT: frozenset[str] = frozenset(
    {
        "password",
        "passwd",
        "secret",
        "api_key",
        "access_token",
        "refresh_token",
        "private_key",
        "bearer_token",
        "auth_token",
        "session_token",
    }
)

# Substrings that indicate a secret regardless of the full field name.
_SECRET_SUBSTRINGS: tuple[str, ...] = ("token", "secret", "password", "api_key")

_PII_KEY_EXACT: frozenset[str] = frozenset(
    {
        "ssn",
        "social_security_number",
        "credit_card",
        "card_number",
        "cvv",
        "ccv",
        "date_of_birth",
        "dob",
        "phone_number",
        "phone",
        "mobile",
        "email",
        "email_address",
        "home_address",
        "street_address",
        "zip_code",
        "postal_code",
    }
)

_SYSTEM_KEY_EXACT: frozenset[str] = frozenset(
    {
        "proposed_by",
        "agent_id",
        "tenant_id",
        "action_id",
        "correlation_id",
        "trace_id",
        "_meta",
    }
)


# ---------------------------------------------------------------------------
# Value-level patterns (reused from PIIMasker for consistency)
# ---------------------------------------------------------------------------

_SSN_PATTERN = re.compile(r"\d{3}-\d{2}-\d{4}")
_CARD_PATTERN = re.compile(r"\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4}")
_EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")


def classify_field(key: str, value: Any) -> str:
    """Return the AARM R2 classification for a single context field.

    Resolution order (first match wins):
      1. Key starts with '_' or is in the system set → SYSTEM
      2. Key matches a secret name or contains a secret substring → SECRET
      3. Key matches a PII name → PII
      4. Value (if string) matches SSN/card/email pattern → PII
      5. Default → INTERNAL

    PUBLIC is never inferred automatically — callers must tag it explicitly
    via a key ending in ``_public`` or a ``classification`` hint.
    """
    key_lower = key.lower()

    if key.startswith("_") or key_lower in _SYSTEM_KEY_EXACT:
        return SYSTEM

    if key_lower in _SECRET_KEY_EXACT:
        return SECRET
    if any(sub in key_lower for sub in _SECRET_SUBSTRINGS):
        return SECRET

    if key_lower in _PII_KEY_EXACT:
        return PII

    if isinstance(value, str):
        if _SSN_PATTERN.search(value) or _CARD_PATTERN.search(value) or _EMAIL_PATTERN.search(value):
            return PII

    if key_lower.endswith("_public"):
        return PUBLIC

    return INTERNAL

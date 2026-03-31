"""PII / token masking for action payloads.

Masks sensitive fields before action parameters are persisted.
Satisfies HIPAA and GDPR requirements for data minimization at ingestion.
"""
from __future__ import annotations

import copy
import os
import re

# ---------------------------------------------------------------------------
# Sensitive field names (case-insensitive key match)
# ---------------------------------------------------------------------------

_DEFAULT_SENSITIVE_KEYS: frozenset[str] = frozenset(
    {
        "ssn",
        "social_security_number",
        "credit_card",
        "card_number",
        "cvv",
        "ccv",
        "password",
        "passwd",
        "secret",
        "api_key",
        "access_token",
        "refresh_token",
        "private_key",
        "date_of_birth",
        "dob",
        "phone_number",
        "phone",
        "mobile",
    }
)

# email is only masked when found inside these parent key contexts
_EMAIL_CONTEXT_KEYS: frozenset[str] = frozenset({"pii_fields", "sensitive_data"})

# ---------------------------------------------------------------------------
# Value-level pattern detection
# ---------------------------------------------------------------------------

_SSN_PATTERN = re.compile(r"\d{3}-\d{2}-\d{4}")
_CARD_PATTERN = re.compile(r"\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4}")
_EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")


def _mask_value_by_pattern(value: str) -> str:
    """Replace value if it matches a PII pattern; return original if not."""
    if _SSN_PATTERN.search(value):
        return "[MASKED:SSN]"
    if _CARD_PATTERN.search(value):
        return "[MASKED:CARD]"
    if _EMAIL_PATTERN.search(value):
        return "[MASKED:EMAIL]"
    return value


def _load_custom_fields() -> frozenset[str]:
    """Read MASKED_FIELDS env var (comma-separated) and return as a lowercase frozenset."""
    raw = os.getenv("MASKED_FIELDS", "")
    if not raw.strip():
        return frozenset()
    return frozenset(f.strip().lower() for f in raw.split(",") if f.strip())


class PIIMasker:
    """Recursively mask sensitive fields in action payloads."""

    def mask(self, payload: dict) -> dict:
        """Return a deep copy of *payload* with sensitive fields masked.

        The original dict is never modified.
        """
        extra = _load_custom_fields()
        sensitive = _DEFAULT_SENSITIVE_KEYS | extra
        return self._mask_dict(payload, sensitive, parent_key=None)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _mask_dict(
        self,
        obj: dict,
        sensitive: frozenset[str],
        parent_key: str | None,
    ) -> dict:
        result = {}
        for key, value in obj.items():
            lower_key = key.lower()

            # Determine if this key should always be masked
            should_mask = lower_key in sensitive

            # email is only masked inside pii_fields / sensitive_data contexts
            if lower_key == "email" and parent_key is not None:
                should_mask = parent_key.lower() in _EMAIL_CONTEXT_KEYS

            if should_mask:
                result[key] = self._mask_scalar(value)
            else:
                result[key] = self._mask_value(value, sensitive, parent_key=key)

        return result

    def _mask_value(self, value, sensitive: frozenset[str], parent_key: str | None):
        if isinstance(value, dict):
            return self._mask_dict(value, sensitive, parent_key=parent_key)
        if isinstance(value, list):
            return [self._mask_value(item, sensitive, parent_key=parent_key) for item in value]
        if isinstance(value, str):
            return _mask_value_by_pattern(value)
        return value

    @staticmethod
    def _mask_scalar(value):
        if isinstance(value, str):
            return "[MASKED]"
        if isinstance(value, (int, float)):
            return 0
        # For other types (list, dict, bool, None) fall back to "[MASKED]"
        return "[MASKED]"

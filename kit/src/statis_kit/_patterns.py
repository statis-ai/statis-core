"""Built-in guard patterns for prompt injection detection.

Each pattern is a dict with:
  id:       unique identifier
  category: one of instruction_override, authority_impersonation,
            external_anomalies, hidden_text
  pattern:  regex string (case-insensitive by default)
  flags:    optional regex flags override
"""
from __future__ import annotations

BUILTIN_PATTERNS: list[dict[str, str]] = [
    # -----------------------------------------------------------------------
    # instruction_override — attempts to reset or replace system instructions
    # -----------------------------------------------------------------------
    {
        "id": "io_ignore_previous",
        "category": "instruction_override",
        "pattern": r"(?:ignore|disregard|forget|override|bypass)\s+(?:all\s+)?(?:previous|above|prior|earlier|preceding)\s+(?:instructions?|prompts?|rules?|guidelines?|directives?|context)",
    },
    {
        "id": "io_new_instructions",
        "category": "instruction_override",
        "pattern": r"(?:new|updated|revised|replacement)\s+(?:system\s+)?(?:instructions?|prompt|directive|task|role)\s*[:.]",
    },
    {
        "id": "io_you_are_now",
        "category": "instruction_override",
        "pattern": r"you\s+are\s+now\s+(?:a|an|the|my)\s+\w+",
    },
    {
        "id": "io_do_not_follow",
        "category": "instruction_override",
        "pattern": r"(?:do\s+not|don'?t|stop)\s+follow(?:ing)?\s+(?:your|the|any)\s+(?:previous|original|initial|system)\s+(?:instructions?|rules?|guidelines?|prompt)",
    },
    {
        "id": "io_jailbreak_keywords",
        "category": "instruction_override",
        "pattern": r"(?:DAN|STAN|DUDE|AIM)\s+mode|(?:developer|maintenance|god|sudo|root)\s+mode|jailbreak",
    },
    # -----------------------------------------------------------------------
    # authority_impersonation — pretending to be system / admin / developer
    # -----------------------------------------------------------------------
    {
        "id": "ai_system_prefix",
        "category": "authority_impersonation",
        "pattern": r"^(?:SYSTEM|ADMIN|DEVELOPER|OPERATOR|ENGINEER(?:ING)?)\s*:\s*",
    },
    {
        "id": "ai_authorization_code",
        "category": "authority_impersonation",
        "pattern": r"(?:authorization|auth|access)\s+(?:code|token|key)\s*:\s*\S+",
    },
    {
        "id": "ai_im_the_developer",
        "category": "authority_impersonation",
        "pattern": r"(?:i\s+am|i'?m)\s+(?:the|your|a)\s+(?:developer|admin(?:istrator)?|system\s+admin|operator|engineer|owner|creator)",
    },
    {
        "id": "ai_new_directive",
        "category": "authority_impersonation",
        "pattern": r"(?:new|updated?)\s+directive\s+from\s+(?:engineering|development|admin|management|security)\s+team",
    },
    {
        "id": "ai_override_command",
        "category": "authority_impersonation",
        "pattern": r"(?:admin|system|security|master)\s*[-_]?\s*override",
    },
    # -----------------------------------------------------------------------
    # external_anomalies — suspicious URLs, emails, data exfiltration
    # -----------------------------------------------------------------------
    {
        "id": "ea_data_exfil_email",
        "category": "external_anomalies",
        "pattern": r"(?:forward|send|email|transmit|exfiltrate|leak)\s+(?:all\s+)?(?:customer|user|private|internal|sensitive|confidential)?\s*(?:data|information|records|credentials|passwords|keys|tokens)\s+to\s+\S+@\S+",
    },
    {
        "id": "ea_data_exfil_url",
        "category": "external_anomalies",
        "pattern": r"(?:post|send|upload|transmit|forward)\s+(?:all\s+)?(?:data|information|records|responses?)\s+to\s+https?://",
    },
    {
        "id": "ea_grant_access",
        "category": "external_anomalies",
        "pattern": r"(?:grant|give|assign|add)\s+(?:admin|root|full|elevated)\s+(?:access|permissions?|privileges?|rights?)\s+to\s+(?:user|account|id)\s+",
    },
    {
        "id": "ea_encoded_instructions",
        "category": "external_anomalies",
        "pattern": r"(?:execute|run|eval|decode)\s+(?:the\s+)?(?:following\s+)?(?:base64|encoded|hex)\s*:",
    },
    # -----------------------------------------------------------------------
    # hidden_text — zero-width characters, homoglyphs, steganographic tricks
    # -----------------------------------------------------------------------
    {
        "id": "ht_zero_width",
        "category": "hidden_text",
        "pattern": r"[\u200b\u200c\u200d\u200e\u200f\u2060\u2061\u2062\u2063\u2064\ufeff]{2,}",
    },
    {
        "id": "ht_tag_like_injection",
        "category": "hidden_text",
        "pattern": r"<\s*(?:system|admin|instruction|prompt|override|ignore)\s*>",
    },
]

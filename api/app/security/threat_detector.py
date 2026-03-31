"""Real-time threat detection for action proposals.

Scans action_type and payload for prompt injection, credential exfiltration,
destructive command patterns, and oversized strings before policy evaluation.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass
class ThreatScanResult:
    is_threat: bool
    threat_level: str  # "none" | "low" | "medium" | "high" | "critical"
    threat_types: list[str]
    details: str


# ---------------------------------------------------------------------------
# Pattern definitions
# ---------------------------------------------------------------------------

_PROMPT_INJECTION_PATTERNS = re.compile(
    r"ignore\s+(previous|all\s+prior)\s+instructions|"
    r"disregard\s+your|"
    r"you\s+are\s+now|"
    r"new\s+instructions\s*:|"
    r"\[INST\]|"
    r"<\|system\|>|"
    r"</?\s*system\s*/?>",
    re.IGNORECASE,
)

_CREDENTIAL_KEY_PATTERN = re.compile(
    r"^(password|api_key|secret|token|private_key|credentials|auth_token|access_token)$",
    re.IGNORECASE,
)

_CREDENTIAL_VALUE_PATTERN = re.compile(
    r"^(sk_live_|pk_live_|ghp_|xoxb-|xapp-|Bearer\s)",
    re.IGNORECASE,
)

_DESTRUCTIVE_ACTION_PATTERN = re.compile(
    r"delete_all|drop_|truncate_|wipe_|purge_all",
    re.IGNORECASE,
)

_DESTRUCTIVE_VALUE_PATTERNS = re.compile(
    r"rm\s+-rf|"
    r"DROP\s+TABLE|"
    r"DELETE\s+FROM\s+\w+\s*(?!WHERE)|"
    r"TRUNCATE\s+",
    re.IGNORECASE,
)

_MAX_STRING_LENGTH = 10_000


# ---------------------------------------------------------------------------
# Scanner
# ---------------------------------------------------------------------------

class ThreatDetector:
    def scan(self, action_type: str, payload: dict) -> ThreatScanResult:
        threat_types: list[str] = []
        details_parts: list[str] = []

        # 1. Destructive action type
        if _DESTRUCTIVE_ACTION_PATTERN.search(action_type):
            threat_types.append("destructive_action_type")
            details_parts.append(f"action_type '{action_type}' matches destructive pattern")

        # 2. Scan payload values recursively
        self._scan_dict(payload, threat_types, details_parts, depth=0)

        if not threat_types:
            return ThreatScanResult(
                is_threat=False,
                threat_level="none",
                threat_types=[],
                details="",
            )

        # Assign severity
        level = self._severity(threat_types)
        return ThreatScanResult(
            is_threat=True,
            threat_level=level,
            threat_types=threat_types,
            details="; ".join(details_parts),
        )

    def _scan_dict(
        self,
        obj: dict,
        threat_types: list[str],
        details: list[str],
        depth: int,
    ) -> None:
        if depth > 5:
            return
        for key, value in obj.items():
            # Credential key exfiltration
            if _CREDENTIAL_KEY_PATTERN.match(str(key)):
                threat_types.append("credential_key_exfiltration")
                details.append(f"payload key '{key}' is a sensitive credential field")

            if isinstance(value, str):
                self._scan_string(key, value, threat_types, details)
            elif isinstance(value, dict):
                self._scan_dict(value, threat_types, details, depth + 1)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        self._scan_dict(item, threat_types, details, depth + 1)
                    elif isinstance(item, str):
                        self._scan_string(key, item, threat_types, details)

    def _scan_string(
        self,
        key: str,
        value: str,
        threat_types: list[str],
        details: list[str],
    ) -> None:
        # Oversized string
        if len(value) > _MAX_STRING_LENGTH:
            if "oversized_payload" not in threat_types:
                threat_types.append("oversized_payload")
                details.append(
                    f"payload field '{key}' exceeds {_MAX_STRING_LENGTH} characters "
                    f"(length={len(value)})"
                )

        # Prompt injection
        if _PROMPT_INJECTION_PATTERNS.search(value):
            if "prompt_injection" not in threat_types:
                threat_types.append("prompt_injection")
                details.append(f"prompt injection pattern detected in field '{key}'")

        # Credential value
        if _CREDENTIAL_VALUE_PATTERN.search(value):
            if "credential_value_exfiltration" not in threat_types:
                threat_types.append("credential_value_exfiltration")
                details.append(f"credential-like value detected in field '{key}'")

        # Destructive command
        if _DESTRUCTIVE_VALUE_PATTERNS.search(value):
            if "destructive_command" not in threat_types:
                threat_types.append("destructive_command")
                details.append(f"destructive command pattern in field '{key}'")

    @staticmethod
    def _severity(threat_types: list[str]) -> str:
        if "prompt_injection" in threat_types or "credential_value_exfiltration" in threat_types:
            return "critical"
        if "destructive_command" in threat_types or "credential_key_exfiltration" in threat_types:
            return "high"
        if "oversized_payload" in threat_types:
            return "medium"
        return "low"

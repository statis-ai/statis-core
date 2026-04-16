"""Pattern-based injection guard — pure local, zero latency budget."""
from __future__ import annotations

import re
from typing import Any, Optional

from ._patterns import BUILTIN_PATTERNS
from ._types import GuardConfig, GuardDetection, Message


class GuardHaltError(Exception):
    """Raised when on_detect='halt' and an injection is found."""

    def __init__(self, detections: list[GuardDetection]) -> None:
        count = len(detections)
        super().__init__(f"Guard halted: {count} injection(s) detected")
        self.detections = detections


class GuardResult:
    __slots__ = ("clean", "detections", "messages")

    def __init__(
        self,
        clean: bool,
        detections: list[GuardDetection],
        messages: list[Message],
    ) -> None:
        self.clean = clean
        self.detections = detections
        self.messages = messages


class Guard:
    def __init__(self, config: Optional[GuardConfig] = None) -> None:
        cfg = config or GuardConfig()
        self._on_detect = cfg.on_detect
        disabled = set(cfg.disabled_categories or [])

        # Build compiled pattern list
        raw_patterns: list[dict[str, Any]] = []
        for p in BUILTIN_PATTERNS:
            if p["category"] not in disabled:
                raw_patterns.append(p)
        for p in (cfg.extra_patterns or []):
            if p.get("category", "") not in disabled:
                raw_patterns.append(p)

        self._patterns: list[tuple[str, str, re.Pattern[str]]] = []
        for p in raw_patterns:
            flags = re.IGNORECASE | re.MULTILINE
            self._patterns.append((
                p["id"],
                p["category"],
                re.compile(p["pattern"], flags),
            ))

    def scan(self, messages: list[Message]) -> GuardResult:
        """Scan all messages for injection patterns."""
        detections: list[GuardDetection] = []
        cleaned: list[Message] = []

        for i, msg in enumerate(messages):
            # Only scan user and tool messages — system/assistant are trusted
            if msg.role not in ("user", "tool"):
                cleaned.append(msg)
                continue

            msg_detections: list[GuardDetection] = []
            content = msg.content

            for pat_id, cat, regex in self._patterns:
                for match in regex.finditer(content):
                    msg_detections.append(GuardDetection(
                        turn_index=i,
                        pattern_id=pat_id,
                        category=cat,
                        matched_text=match.group(),
                        action_taken=self._on_detect,
                    ))

            if msg_detections:
                detections.extend(msg_detections)

                if self._on_detect == "halt":
                    raise GuardHaltError(detections)

                # Strip mode: remove matched content
                stripped_content = content
                for det in msg_detections:
                    stripped_content = stripped_content.replace(det.matched_text, "")
                stripped_content = re.sub(r"\s{2,}", " ", stripped_content).strip()

                cleaned.append(Message(
                    role=msg.role,
                    content=stripped_content,
                    name=msg.name,
                    tool_call_id=msg.tool_call_id,
                    metadata=msg.metadata,
                ))
            else:
                cleaned.append(msg)

        return GuardResult(
            clean=len(detections) == 0,
            detections=detections,
            messages=cleaned,
        )

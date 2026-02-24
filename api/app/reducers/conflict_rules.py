"""Conflict resolution rules for contested state fields.

Source precedence (highest to lowest):
    system-of-record  >  human  >  agent

When two events set the same field, the higher-precedence source wins.
If sources are equal, the standard ordering key
``(occurred_at, ingested_at, event_id)`` is the tie-breaker (later wins).
"""
from __future__ import annotations

from typing import Optional

_PRECEDENCE = {
    "system": 3,
    "human": 2,
    "agent": 1,
}

DEFAULT_PRECEDENCE = 0


def source_rank(producer: str) -> int:
    """Map a producer string to a numeric precedence rank.

    Producers should contain one of the known source keywords
    (``system``, ``human``, ``agent``).  If none match, the default
    (lowest) precedence is returned.
    """
    lower = producer.lower()
    for key, rank in _PRECEDENCE.items():
        if key in lower:
            return rank
    return DEFAULT_PRECEDENCE


def should_apply(
    existing_source: Optional[str],
    new_source: str,
) -> bool:
    """Return True if *new_source* should overwrite a field previously set by
    *existing_source*.

    Rules:
    - If there is no existing source, always apply.
    - Higher-precedence source always wins.
    - Equal precedence: apply (later event in ordering wins by default).
    """
    if existing_source is None:
        return True
    return source_rank(new_source) >= source_rank(existing_source)

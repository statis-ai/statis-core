"""Capped exponential backoff for the @statis.gate decorator's poll loop.

D15 from /plan-eng-review:

  attempt:    1     2     3     4     5     6     7     8     9    10
  wait (s):  0.5   1.0   2.0   4.0   5.0   5.0   5.0   5.0   5.0   5.0
              │     │     │     │     └─── cap reached ───────────────
              └─────┴─────┴─── exponential ─────────────────────────────

Why capped: at 5s the agent process burns minimal CPU but still picks up
human approvals fast enough that the demo doesn't feel laggy. SSE / long-
poll arrives Week 3-4 once we have real wait-distribution telemetry from
a design partner integration.
"""
from __future__ import annotations

from typing import Iterator


# Tuple, not list — this is a constant. Tests assert on it directly.
DEFAULT_BACKOFF_S: tuple[float, ...] = (0.5, 1.0, 2.0, 4.0, 5.0)
DEFAULT_CAP_S: float = 5.0


def backoff_curve(
    *,
    schedule: tuple[float, ...] = DEFAULT_BACKOFF_S,
    cap_s: float = DEFAULT_CAP_S,
) -> Iterator[float]:
    """Yield wait-times forever: schedule then `cap_s` indefinitely.

    The decorator's poll loop wraps this with a deadline, so the iterator
    has no terminating condition — the deadline is the only stop.
    """
    for s in schedule:
        yield s
    while True:
        yield cap_s

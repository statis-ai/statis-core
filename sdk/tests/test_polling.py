"""Lane 2 — polling backoff curve.

D15: 0.5 → 1 → 2 → 4 → 5s, then cap at 5s indefinitely.
"""
from __future__ import annotations

from itertools import islice

from statis._polling import DEFAULT_BACKOFF_S, DEFAULT_CAP_S, backoff_curve


def test_default_curve_matches_d15() -> None:
    assert DEFAULT_BACKOFF_S == (0.5, 1.0, 2.0, 4.0, 5.0)
    assert DEFAULT_CAP_S == 5.0


def test_curve_yields_schedule_then_caps() -> None:
    waits = list(islice(backoff_curve(), 10))
    assert waits == [0.5, 1.0, 2.0, 4.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0]


def test_curve_is_independent_iterator() -> None:
    """Each call returns a fresh iterator — important for multiple in-flight calls."""
    a = backoff_curve()
    b = backoff_curve()
    assert next(a) == next(b) == 0.5


def test_custom_schedule_and_cap() -> None:
    waits = list(islice(backoff_curve(schedule=(0.1, 0.2), cap_s=1.0), 5))
    assert waits == [0.1, 0.2, 1.0, 1.0, 1.0]

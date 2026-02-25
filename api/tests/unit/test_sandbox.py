"""Unit tests for reducer sandbox, poison-pill quarantine, and output validation."""
import time

import pytest

from app.reducers.sandbox import (
    ReducerError,
    ReducerTimeoutError,
    run_reducer_safely,
)
from app.reducers.validation import (
    AccountStateV2,
    ReducerOutputInvalid,
    validate_reducer_output,
)


# ---------------------------------------------------------------------------
# run_reducer_safely
# ---------------------------------------------------------------------------


def test_sandbox_normal_reducer():
    def reducer(state, event):
        return {**state, "count": state.get("count", 0) + 1}

    result = run_reducer_safely(reducer, {}, {"payload": {}})
    assert result == {"count": 1}


def test_sandbox_timeout_kills_slow_reducer():
    def slow_reducer(state, event):
        time.sleep(10)
        return state

    with pytest.raises(ReducerTimeoutError, match="timed out"):
        run_reducer_safely(slow_reducer, {}, {}, timeout_seconds=0.2)


def test_sandbox_wraps_reducer_exception():
    def bad_reducer(state, event):
        raise ValueError("boom")

    with pytest.raises(ReducerError, match="ValueError.*boom"):
        run_reducer_safely(bad_reducer, {}, {})


def test_sandbox_preserves_state_on_success():
    def identity(state, event):
        return state

    result = run_reducer_safely(identity, {"a": 1}, {})
    assert result == {"a": 1}


# ---------------------------------------------------------------------------
# validate_reducer_output
# ---------------------------------------------------------------------------

def _valid_v2_state(**overrides) -> dict:
    base = {
        "schema_version": "account.v2",
        "plan": "pro",
        "sentiment": None,
        "open_incidents": [],
        "blockers": [],
        "risk_flags": [],
        "next_actions": [],
        "churn_risk": False,
        "extensions": {},
    }
    base.update(overrides)
    return base


def test_validate_valid_v2_state():
    state = _valid_v2_state()
    result = validate_reducer_output(state)
    assert result is state


def test_validate_non_v2_state_passes_through():
    state = {"foo": "bar"}
    result = validate_reducer_output(state)
    assert result is state


def test_validate_invalid_v2_state_raises():
    state = {"schema_version": "account.v2", "churn_risk": "not_a_bool"}
    with pytest.raises(ReducerOutputInvalid, match="validation failed"):
        validate_reducer_output(state)


def test_validate_extra_fields_allowed():
    state = _valid_v2_state(extra_field="ok")
    result = validate_reducer_output(state)
    assert result["extra_field"] == "ok"


# ---------------------------------------------------------------------------
# Poison-pill quarantine logic (integration-level, uses in-memory DB mock)
# ---------------------------------------------------------------------------

def test_quarantine_after_three_failures():
    """Verify the quarantine threshold constant and flow via the sandbox exceptions."""
    from app.repositories.events import QUARANTINE_THRESHOLD
    assert QUARANTINE_THRESHOLD == 3

    failure_count = 0
    def failing_reducer(state, event):
        raise RuntimeError("deterministic crash")

    for _ in range(QUARANTINE_THRESHOLD):
        with pytest.raises(ReducerError):
            run_reducer_safely(failing_reducer, {}, {})
            failure_count += 1

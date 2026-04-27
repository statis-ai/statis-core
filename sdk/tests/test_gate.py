"""Lane 2 — @statis.gate runtime tests.

Covers the propose → evaluate → poll → execute → complete flow plus all
explicitly-named failure modes from the plan: APPROVED fast-path, DENIED,
ESCALATED (immediate, non-blocking), DEFERRED, PROPOSED → APPROVED via
poll, timeout → ActionPending, fail_open behavior, STATIS_DISABLED
pass-through, MissingAPIKeyError.

Mocks via respx (existing pattern in test_client.py).
"""
from __future__ import annotations

import os

import pytest
import respx
from httpx import Response

from statis import (
    ActionDeniedError,
    ActionEscalatedError,
    ActionPending,
    MissingAPIKeyError,
    gate,
    kwargs_only,
)


BASE = "https://api.statis.dev"


@pytest.fixture(autouse=True)
def _isolate_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Strip any host env that would leak into a test run."""
    for key in ("STATIS_API_KEY", "STATIS_BASE_URL", "STATIS_AGENT_ID", "STATIS_DISABLED"):
        monkeypatch.delenv(key, raising=False)


def _action(action_id: str = "act-1", status: str = "PROPOSED") -> dict:
    return {
        "action_id": action_id,
        "status": status,
        "proposed_by": "test-agent",
        "action_type": "send_money",
        "target_entity": {"entity_type": "gate", "entity_id": "x"},
        "target_system": "agent",
        "parameters": {"amount": 50},
        "context": {},
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def _receipt(action_id: str = "act-1", decision: str = "APPROVED") -> dict:
    return {
        "receipt_id": f"rcpt-{action_id}",
        "action_id": action_id,
        "decision": decision,
        "rule_id": "test-rule",
        "rule_version": "1",
        "approved_by": "policy_engine",
        "conditions_evaluated": {},
        "execution_result": {},
        "executed_at": "2024-01-01T00:00:01+00:00",
        "hash": "deadbeef",
        "created_at": "2024-01-01T00:00:00+00:00",
    }


# ---------------------------------------------------------------------------
# Decoration-time validation (already covered in skeleton tests; sanity here)
# ---------------------------------------------------------------------------


def test_timeout_zero_raises_at_decoration_time() -> None:
    with pytest.raises(TypeError):
        @gate(action_name="x", timeout_s=0)
        def fn() -> None:
            pass


def test_generator_target_raises_at_decoration_time() -> None:
    from statis import DecorationTimeError

    with pytest.raises(DecorationTimeError):
        @gate(action_name="x")
        def fn():
            yield 1


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------


def test_missing_api_key_raises_at_first_call() -> None:
    @gate(action_name="x")
    def fn() -> int:
        return 1

    with pytest.raises(MissingAPIKeyError):
        fn()


def test_explicit_api_key_overrides_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """api_key= on @gate beats STATIS_API_KEY env."""
    monkeypatch.setenv("STATIS_API_KEY", "from-env")

    @gate(action_name="x", api_key="from-decorator")
    def fn() -> int:
        return 1

    @respx.mock
    def _run() -> int:
        propose = respx.post(f"{BASE}/actions").mock(
            return_value=Response(201, json=_action())
        )
        respx.post(f"{BASE}/actions/act-1/evaluate").mock(
            return_value=Response(200, json={"decision": "APPROVED"})
        )
        respx.patch(f"{BASE}/actions/act-1/complete").mock(
            return_value=Response(200, json=_action(status="COMPLETED"))
        )
        result = fn()
        # Verify the explicit key landed on the request, not the env one.
        assert propose.calls.last.request.headers["X-API-Key"] == "from-decorator"
        return result

    assert _run() == 1


# ---------------------------------------------------------------------------
# Fast-path decisions (immediately resolved at /evaluate)
# ---------------------------------------------------------------------------


@respx.mock
def test_approved_fast_path_runs_function_and_completes() -> None:
    respx.post(f"{BASE}/actions").mock(return_value=Response(201, json=_action()))
    respx.post(f"{BASE}/actions/act-1/evaluate").mock(
        return_value=Response(200, json={"decision": "APPROVED"})
    )
    complete = respx.patch(f"{BASE}/actions/act-1/complete").mock(
        return_value=Response(200, json=_action(status="COMPLETED"))
    )

    @gate(action_name="send_money", api_key="k")
    def send(amount: int) -> dict:
        return {"sent": amount}

    assert send(50) == {"sent": 50}
    assert complete.called
    body = complete.calls.last.request.read()
    assert b"\"sent\":50" in body or b"sent" in body


@respx.mock
def test_denied_raises_action_denied_error() -> None:
    respx.post(f"{BASE}/actions").mock(return_value=Response(201, json=_action()))
    respx.post(f"{BASE}/actions/act-1/evaluate").mock(
        return_value=Response(200, json={"decision": "DENIED"})
    )
    respx.get(f"{BASE}/receipts/act-1").mock(
        return_value=Response(200, json=_receipt(decision="DENIED"))
    )

    @gate(action_name="send_money", api_key="k")
    def send(amount: int) -> dict:
        return {"sent": amount}

    with pytest.raises(ActionDeniedError) as info:
        send(50)
    assert info.value.receipt.action_id == "act-1"


@respx.mock
def test_escalated_raises_immediately_no_polling() -> None:
    """STEP_UP / ESCALATED should NOT block the agent — raise immediately."""
    respx.post(f"{BASE}/actions").mock(return_value=Response(201, json=_action()))
    respx.post(f"{BASE}/actions/act-1/evaluate").mock(
        return_value=Response(200, json={"decision": "STEP_UP"})
    )

    @gate(action_name="x", api_key="k")
    def fn() -> int:
        return 99

    with pytest.raises(ActionEscalatedError):
        fn()


# ---------------------------------------------------------------------------
# Polling path — PROPOSED awaits human, then APPROVED → run + complete
# ---------------------------------------------------------------------------


@respx.mock
def test_proposed_then_approved_via_poll(monkeypatch: pytest.MonkeyPatch) -> None:
    """If /evaluate returns no terminal decision, poll until APPROVED."""
    # Patch sleep to avoid real waits.
    monkeypatch.setattr("statis.decorator.time.sleep", lambda _s: None)

    respx.post(f"{BASE}/actions").mock(return_value=Response(201, json=_action()))
    respx.post(f"{BASE}/actions/act-1/evaluate").mock(
        return_value=Response(
            200,
            json={"decision": "PROPOSED", "approval_url": "https://statis.dev/a/act-1?sig=x"},
        )
    )
    poll = respx.get(f"{BASE}/actions/act-1").mock(
        side_effect=[
            Response(200, json=_action(status="PROPOSED")),
            Response(200, json=_action(status="PROPOSED")),
            Response(200, json=_action(status="APPROVED")),
        ]
    )
    respx.patch(f"{BASE}/actions/act-1/complete").mock(
        return_value=Response(200, json=_action(status="COMPLETED"))
    )

    @gate(action_name="x", api_key="k", timeout_s=60)
    def fn() -> str:
        return "ran"

    assert fn() == "ran"
    assert poll.call_count == 3


@respx.mock
def test_polling_timeout_raises_action_pending(monkeypatch: pytest.MonkeyPatch) -> None:
    """timeout_s exceeded → ActionPending with resume_url; function NEVER runs."""
    monkeypatch.setattr("statis.decorator.time.sleep", lambda _s: None)
    # Force monotonic to march forward fast enough to blow timeout.
    fake_now = [1000.0]

    def fake_monotonic() -> float:
        fake_now[0] += 10
        return fake_now[0]

    monkeypatch.setattr("statis.decorator.time.monotonic", fake_monotonic)

    respx.post(f"{BASE}/actions").mock(return_value=Response(201, json=_action()))
    respx.post(f"{BASE}/actions/act-1/evaluate").mock(
        return_value=Response(
            200,
            json={"decision": "PROPOSED", "approval_url": "https://statis.dev/a/act-1?sig=x"},
        )
    )
    respx.get(f"{BASE}/actions/act-1").mock(
        return_value=Response(200, json=_action(status="PROPOSED"))
    )

    ran = []

    @gate(action_name="x", api_key="k", timeout_s=5)
    def fn() -> None:
        ran.append(True)

    with pytest.raises(ActionPending) as info:
        fn()
    assert info.value.action_id == "act-1"
    assert "act-1" in info.value.resume_url
    assert ran == []  # function MUST NOT have executed


# ---------------------------------------------------------------------------
# fail_open / fail_closed
# ---------------------------------------------------------------------------


@respx.mock
def test_fail_open_executes_when_propose_fails() -> None:
    """on_error='fail_open' → function runs even if propose 5xx's."""
    respx.post(f"{BASE}/actions").mock(return_value=Response(503, text="upstream down"))

    @gate(action_name="read_thing", api_key="k", on_error="fail_open")
    def read() -> str:
        return "fallback-result"

    assert read() == "fallback-result"


@respx.mock
def test_fail_closed_propagates_propose_error() -> None:
    respx.post(f"{BASE}/actions").mock(return_value=Response(503, text="upstream down"))

    @gate(action_name="x", api_key="k", on_error="fail_closed")
    def fn() -> int:
        return 1  # MUST NOT run

    from statis import StatisError

    with pytest.raises(StatisError):
        fn()


# ---------------------------------------------------------------------------
# STATIS_DISABLED — pass-through with rate-limited warning (D9 / P7)
# ---------------------------------------------------------------------------


def test_statis_disabled_runs_function_with_no_api_call(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.setenv("STATIS_DISABLED", "1")
    # The rate-limit cache is module-global; reset so this test stands alone
    # regardless of other tests in the same run that reuse the same key.
    from statis.decorator import _last_disabled_warn

    _last_disabled_warn.clear()
    # No mock at all — if the SDK called the API the test would error out.

    @gate(action_name="something_dangerous")
    def dangerous() -> str:
        return "ran-anyway"

    caplog.set_level("WARNING")
    assert dangerous() == "ran-anyway"
    assert any("STATIS_DISABLED" in r.getMessage() for r in caplog.records)


def test_statis_disabled_warning_is_rate_limited(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """P7 — second call within 60s of the same gate must NOT re-warn."""
    monkeypatch.setenv("STATIS_DISABLED", "1")
    from statis.decorator import _last_disabled_warn

    _last_disabled_warn.clear()

    @gate(action_name="quiet_action")
    def fn() -> int:
        return 0

    caplog.set_level("WARNING")
    fn()
    fn()
    fn()

    matching = [
        r for r in caplog.records if "quiet_action" in r.getMessage()
    ]
    assert len(matching) == 1


# ---------------------------------------------------------------------------
# Idempotency key threading
# ---------------------------------------------------------------------------


@respx.mock
def test_kwargs_only_idempotency_threads_into_context() -> None:
    propose = respx.post(f"{BASE}/actions").mock(
        return_value=Response(201, json=_action())
    )
    respx.post(f"{BASE}/actions/act-1/evaluate").mock(
        return_value=Response(200, json={"decision": "APPROVED"})
    )
    respx.patch(f"{BASE}/actions/act-1/complete").mock(
        return_value=Response(200, json=_action(status="COMPLETED"))
    )

    @gate(
        action_name="apply_discount",
        api_key="k",
        idempotency_key=kwargs_only("customer_id", "amount"),
    )
    def apply(customer_id: str, amount: int, reason: str) -> dict:
        return {"ok": True}

    assert apply("cus_42", 100, "promo") == {"ok": True}
    body = propose.calls.last.request.content.decode()
    # The hashed key lands in the context payload.
    assert "idempotency_key" in body

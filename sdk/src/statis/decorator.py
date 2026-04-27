"""@statis.gate decorator — primary v0.4.0 surface.

Wraps an agent function so that every call goes through Statis policy +
human approval before the function body actually executes. The wrapped
function returns whatever the original function returns; the receipt is
written as a side-effect for audit.

Flow on call:

  1. Bind args, resolve idempotency_key (caller-supplied or hash-fallback).
  2. POST /actions  → action_id, status=PROPOSED.
  3. POST /actions/{id}/evaluate  → policy decision.
     Fast paths:
       APPROVED  → run function locally → POST /complete → return value
       DENIED    → raise ActionDeniedError
       STEP_UP   → raise ActionEscalatedError (immediately, not blocking)
       DEFERRED  → raise ActionDeferredError
  4. PROPOSED (waiting for human) → poll GET /actions/{id} with capped
     exponential backoff (D15) until terminal or until timeout_s elapses.
     APPROVED on poll → run function locally → POST /complete → return value
     timeout exceeded → raise ActionPending(action_id, resume_url)

Configuration via env vars (so production agents don't have to thread
config through every call site):

  STATIS_API_KEY         tenant API key  (raises MissingAPIKeyError if unset
                         AND no api_key was passed at gate-time)
  STATIS_BASE_URL        default https://api.statis.dev
  STATIS_AGENT_ID        default "anonymous-agent"
  STATIS_DISABLED=1      pass-through mode: no API call, no receipt — emits
                         a startup warning (rate-limited per process per 60s
                         per D9/P7) so accidental "off in prod" is loud

`on_error` semantics on API failure:
  fail_closed (default) → raises StatisError / NetworkError; agent code handles
  fail_open             → proceeds with the function call, logs a warning;
                         intended for non-destructive read actions
"""
from __future__ import annotations

import functools
import inspect
import logging
import os
import time
from typing import Any, Callable, Literal, Optional, TypeVar, Union

from ._idempotency import resolve_idempotency_key
from ._models import (
    ActionDeferredError,
    ActionDeniedError,
    ActionEscalatedError,
    ActionPending,
    DecorationTimeError,
    MissingAPIKeyError,
    NetworkError,
    StatisError,
)
from ._polling import backoff_curve
from .client import StatisClient


_log = logging.getLogger("statis.gate")

# Narrowed Literal types for v0.4.0 (DX8 from /plan-devex-review).
ModeLiteral = Literal["sync"]
RuntimeLiteral = Literal["plain"]
OnErrorLiteral = Literal["fail_closed", "fail_open"]

F = TypeVar("F", bound=Callable[..., Any])


# --- STATIS_DISABLED warning rate-limit (P7) -------------------------------

_DISABLED_WARN_INTERVAL_S = 60.0
_last_disabled_warn: dict[str, float] = {}


def _warn_disabled_once_per_minute(action_name: str) -> None:
    now = time.monotonic()
    last = _last_disabled_warn.get(action_name, float("-inf"))
    if now - last >= _DISABLED_WARN_INTERVAL_S:
        _last_disabled_warn[action_name] = now
        _log.warning(
            "STATIS_DISABLED=1 — '%s' executing as pass-through. NO RECEIPT WRITTEN. "
            "Unset STATIS_DISABLED to restore governance.",
            action_name,
        )


def _is_disabled() -> bool:
    return os.environ.get("STATIS_DISABLED", "").strip() in ("1", "true", "TRUE", "yes")


def gate(
    *,
    action_name: str,
    mode: ModeLiteral = "sync",
    on_error: OnErrorLiteral = "fail_closed",
    timeout_s: int = 300,
    idempotency_key: Optional[Union[str, Callable[..., str]]] = None,
    runtime: RuntimeLiteral = "plain",
    entity: Optional[Callable[[], dict[str, Any]]] = None,
    target_system: str = "agent",
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    agent_id: Optional[str] = None,
) -> Callable[[F], F]:
    """Wrap a function so the agent must request human approval before execution.

    Args:
        action_name: Required. Semantic identifier policies match against.
        mode: 'sync' only in v0.4.0 (async lands v0.5.0).
        on_error: 'fail_closed' (default, safe) or 'fail_open' (proceed on API down).
        timeout_s: Decorator-wait timeout in seconds. Raises ActionPending if exceeded.
        idempotency_key: str | Callable[[BoundArguments], str] | None. None means
            hash-fallback dedup via SHA-256 of (agent_id, action_name, args).
        runtime: 'plain' only in v0.4.0.
        entity: Optional callback returning a state snapshot dict for receipt context.
        target_system: Free-text label routed onto action.target_system.
        api_key / base_url / agent_id: Override env-var defaults.

    Raises:
        TypeError: at decoration time, if `timeout_s <= 0`.
        DecorationTimeError (E010): at decoration time, if applied to a generator,
            async generator, or context manager.
        MissingAPIKeyError (E001): at first call, if no key is configured.
        ActionDeniedError (E005): policy denied the action.
        ActionEscalatedError: policy requires human review (raised immediately).
        ActionDeferredError (E006): policy DEFERRED the action.
        ActionPending (E004): timeout_s elapsed while waiting for a human decision.
        NetworkError (E003) / StatisError: API failure when on_error="fail_closed".

    Example::

        from statis import gate, kwargs_only

        @gate(
            action_name="apply_discount",
            idempotency_key=kwargs_only("customer_id", "amount"),
            timeout_s=120,
        )
        def apply_discount(customer_id: str, amount: int, reason: str) -> dict:
            return stripe.refund(customer_id, amount)
    """
    if timeout_s <= 0:
        raise TypeError(f"@statis.gate(timeout_s={timeout_s}) — timeout_s must be > 0")

    def decorator(fn: F) -> F:
        qualname = getattr(fn, "__qualname__", repr(fn))
        if inspect.isgeneratorfunction(fn):
            raise DecorationTimeError(
                target=qualname,
                reason="generator functions are not supported in v0.4.0",
            )
        if inspect.isasyncgenfunction(fn):
            raise DecorationTimeError(
                target=qualname,
                reason="async generator functions are not supported in v0.4.0",
            )

        sig = inspect.signature(fn)

        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            # STATIS_DISABLED=1 → pass-through, loud warning, no receipt.
            if _is_disabled():
                _warn_disabled_once_per_minute(action_name)
                return fn(*args, **kwargs)

            # Resolve identity + endpoint configuration.
            resolved_agent_id = (
                agent_id or os.environ.get("STATIS_AGENT_ID") or "anonymous-agent"
            )
            from . import _config as _cfg
            resolved_base_url = (
                base_url or os.environ.get("STATIS_BASE_URL")
                or _cfg.load().get("base_url")
                or "https://api.statis.dev"
            )
            resolved_api_key = api_key or os.environ.get("STATIS_API_KEY") or _cfg.get_api_key()
            if not resolved_api_key:
                raise MissingAPIKeyError()

            bound = sig.bind(*args, **kwargs)
            bound.apply_defaults()

            idem_key = resolve_idempotency_key(
                user_supplied=idempotency_key,
                agent_id=resolved_agent_id,
                action_name=action_name,
                bound=bound,
            )

            # Convert BoundArguments to a JSON-friendly parameters dict.
            parameters = _serializable(dict(bound.arguments))
            parameters.pop("self", None)
            parameters.pop("cls", None)

            entity_snapshot = _entity_or_none(entity)

            client = StatisClient(
                api_key=resolved_api_key, base_url=resolved_base_url
            )
            try:
                return _gate_call(
                    client=client,
                    action_name=action_name,
                    parameters=parameters,
                    idem_key=idem_key,
                    agent_id=resolved_agent_id,
                    target_system=target_system,
                    entity_snapshot=entity_snapshot,
                    timeout_s=timeout_s,
                    on_error=on_error,
                    fn=fn,
                    args=args,
                    kwargs=kwargs,
                )
            finally:
                client.close()

        wrapper.__statis_gate__ = {  # type: ignore[attr-defined]
            "action_name": action_name,
            "mode": mode,
            "on_error": on_error,
            "timeout_s": timeout_s,
            "idempotency_key": idempotency_key,
            "runtime": runtime,
            "entity": entity,
            "target_system": target_system,
        }
        return wrapper  # type: ignore[return-value]

    return decorator


# ---------------------------------------------------------------------------
# Internal — kept module-private so importers don't depend on its signature
# ---------------------------------------------------------------------------


def _gate_call(
    *,
    client: StatisClient,
    action_name: str,
    parameters: dict[str, Any],
    idem_key: str,
    agent_id: str,
    target_system: str,
    entity_snapshot: Optional[dict[str, Any]],
    timeout_s: int,
    on_error: OnErrorLiteral,
    fn: Callable[..., Any],
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> Any:
    """Run propose → evaluate → poll → execute → complete. See module docstring."""
    context: dict[str, Any] = {"idempotency_key": idem_key}
    if entity_snapshot is not None:
        context["entity"] = entity_snapshot

    try:
        action_id = client.propose(
            action_type=action_name,
            target={"entity_type": "gate", "entity_id": idem_key[:32]},
            parameters=parameters,
            agent_id=agent_id,
            target_system=target_system,
            context=context,
        )
    except (NetworkError, StatisError) as exc:
        if on_error == "fail_open":
            _log.warning(
                "@gate('%s') propose failed (%s); fail_open → executing locally without receipt",
                action_name, exc,
            )
            return fn(*args, **kwargs)
        raise

    # Trigger policy evaluation. Fast-path: most decisions resolve immediately.
    try:
        evaluate_resp = client._http.post(f"/actions/{action_id}/evaluate")
        client._raise_for_status(evaluate_resp)
        decision = (evaluate_resp.json() or {}).get("decision", "")
    except (NetworkError, StatisError) as exc:
        if on_error == "fail_open":
            _log.warning(
                "@gate('%s') evaluate failed (%s); fail_open → executing locally", action_name, exc
            )
            return fn(*args, **kwargs)
        raise

    if decision == "DENIED":
        receipt = client.get_receipt(action_id)
        raise ActionDeniedError(reason="Action denied by policy", receipt=receipt)
    if decision in ("ESCALATED", "STEP_UP"):
        return _poll_then_execute(
            client=client,
            action_id=action_id,
            timeout_s=timeout_s,
            evaluate_response_json=evaluate_resp.json() or {},
            fn=fn,
            args=args,
            kwargs=kwargs,
        )
    if decision == "DEFERRED":
        raise ActionDeferredError(
            action_id=action_id, reason=(evaluate_resp.json() or {}).get("reason")
        )
    if decision == "MODIFIED":
        # PR-AARM-05 will execute with the modified parameters; until then, treat
        # MODIFIED as deny-with-context so agents don't silently run unexpected args.
        receipt = client.get_receipt(action_id)
        raise ActionDeniedError(
            reason="Action MODIFIED by policy (parameter rewrite pending PR-AARM-05)",
            receipt=receipt,
        )
    if decision == "APPROVED":
        # Auto-approved by policy — fast-path execution.
        return _execute_and_complete(client, action_id, fn, args, kwargs)

    # No fast-path decision — likely PROPOSED awaiting a human via the approval URL.
    return _poll_then_execute(
        client=client,
        action_id=action_id,
        timeout_s=timeout_s,
        evaluate_response_json=evaluate_resp.json() or {},
        fn=fn,
        args=args,
        kwargs=kwargs,
    )


def _poll_then_execute(
    *,
    client: StatisClient,
    action_id: str,
    timeout_s: int,
    evaluate_response_json: dict[str, Any],
    fn: Callable[..., Any],
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> Any:
    """Poll with capped exponential backoff (D15) until terminal or timeout.

    Prints the DX-OV-4 stdout state machine so the developer knows what's
    happening while the decorator blocks.
    """
    import sys

    deadline = time.monotonic() + timeout_s
    backoff = backoff_curve()
    resume_url = evaluate_response_json.get("approval_url") or evaluate_response_json.get(
        "resume_url", ""
    )

    is_tty = hasattr(sys.stdout, "isatty") and sys.stdout.isatty()
    action_name = evaluate_response_json.get("action_type", "action")
    remaining_m = int(timeout_s // 60)
    remaining_s = int(timeout_s % 60)
    print(f"[statis] action_kind '{action_name}' pending approval.")
    if resume_url:
        print(f"[statis] approval URL: {resume_url}")
    print(f"[statis] expires in {remaining_m}:{remaining_s:02d} — waiting...")

    poll_count = 0
    while True:
        wait_s = next(backoff)
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            print("[statis] timeout — action still pending.")
            raise ActionPending(action_id=action_id, resume_url=resume_url)
        time.sleep(min(wait_s, remaining))

        status_str = client.get_action_status(action_id)
        if status_str == "APPROVED":
            approved_msg = f"[statis] approved. Executing..."
            print(approved_msg)
            result = _execute_and_complete(client, action_id, fn, args, kwargs)
            print(f"[statis] done.")
            return result
        if status_str == "DENIED":
            print("[statis] denied.")
            receipt = client.get_receipt(action_id)
            raise ActionDeniedError(reason="Action denied during approval", receipt=receipt)
        if status_str == "DEFERRED":
            raise ActionDeferredError(action_id=action_id)
        # PROPOSED / ESCALATED / STEP_UP / EVALUATING → keep polling
        poll_count += 1
        if is_tty and poll_count % 2 == 0:
            print("[statis] ..", end=" ", flush=True)


def _execute_and_complete(
    client: StatisClient,
    action_id: str,
    fn: Callable[..., Any],
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> Any:
    """Run the wrapped function, post the result, return the function's value."""
    result = fn(*args, **kwargs)
    try:
        complete_resp = client._http.patch(
            f"/actions/{action_id}/complete",
            json={"execution_result": _serializable_value(result)},
        )
        client._raise_for_status(complete_resp)
    except (NetworkError, StatisError) as exc:
        # Receipt completion failures are logged but never override the function
        # result — the action ran successfully even if the audit trail is incomplete.
        _log.warning(
            "POST /actions/%s/complete failed: %s. Result returned anyway.", action_id, exc
        )
    return result


# ---------------------------------------------------------------------------
# JSON-friendliness helpers — keep arbitrary Python values inside parameters
# without raising at httpx serialization time.
# ---------------------------------------------------------------------------


def _serializable(d: dict[str, Any]) -> dict[str, Any]:
    return {k: _serializable_value(v) for k, v in d.items()}


def _serializable_value(v: Any) -> Any:
    if v is None or isinstance(v, (bool, int, float, str)):
        return v
    if isinstance(v, dict):
        return {str(k): _serializable_value(val) for k, val in v.items()}
    if isinstance(v, (list, tuple, set)):
        return [_serializable_value(x) for x in v]
    return repr(v)


def _entity_or_none(entity: Optional[Callable[[], dict[str, Any]]]) -> Optional[dict[str, Any]]:
    """C1 from /plan-eng-review: if entity callback raises, log + proceed with null."""
    if entity is None:
        return None
    try:
        snapshot = entity()
    except Exception as exc:
        _log.warning("entity= callback raised %s; proceeding with null entity_state_snapshot", exc)
        return None
    return _serializable_value(snapshot)

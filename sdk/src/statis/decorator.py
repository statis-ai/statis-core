"""@statis.gate decorator — primary v0.4.0 surface.

This module contains the SKELETON of the @statis.gate decorator that wraps
agent function calls in policy + approval + receipt enforcement.

This file establishes:
- The public signature (mode, on_error, timeout_s, idempotency_key, runtime, entity)
- Decoration-time validation (target shape per D11, timeout_s > 0 per Q5)
- Imports + types so other code (console, tests, examples) can import gate
  before the runtime is fully wired in LANE 2

Calling a decorated function before LANE 2 lands raises NotImplementedError
with a pointer to the plan.

Plan reference: aniketkumar-setup-gstack-design-20260424-090306.md line 47-58.
"""

from __future__ import annotations

import functools
import inspect
from typing import Any, Callable, Literal, Optional, TypeVar, Union

from ._models import DecorationTimeError

# Narrowed Literal types for v0.4.0 (DX8 from /plan-devex-review).
# Widen as features land:
#   - mode: add "async" + "auto" in v0.5.0 with native event-loop runtime
#   - runtime: add "crewai", "langgraph", "temporal" in v0.5.0 with framework probes
#   - on_error: add "queue" in v0.5.0 with local SQLite durable queue
ModeLiteral = Literal["sync"]
RuntimeLiteral = Literal["plain"]
OnErrorLiteral = Literal["fail_closed", "fail_open"]

F = TypeVar("F", bound=Callable[..., Any])


def gate(
    *,
    action_name: str,
    mode: ModeLiteral = "sync",
    on_error: OnErrorLiteral = "fail_closed",
    timeout_s: int = 300,
    idempotency_key: Optional[Union[str, Callable[..., str]]] = None,
    runtime: RuntimeLiteral = "plain",
    entity: Optional[Callable[[], dict[str, Any]]] = None,
) -> Callable[[F], F]:
    """Wrap a function so the agent must request human approval before execution.

    Plan reference: line 47-58 (the locked v0.4.0 public API).

    Args:
        action_name: Required. Semantic identifier policies match against.
        mode: 'sync' only in v0.4.0 (async lands v0.5.0 per OV4 + DX-OV-3).
        on_error: 'fail_closed' (default, safe) or 'fail_open' (proceed on API down).
            'queue' (local SQLite) arrives v0.5.0.
        timeout_s: Decorator-wait timeout in seconds. Raises ActionPending if
            exceeded. Must be > 0.
        idempotency_key: Caller-supplied or framework-native identifier. None means
            hash-fallback dedup via SHA-256 of (agent_id, action_type, JCS-canonical
            args). Callable form preferred (DX9) — receives BoundArguments.
        runtime: 'plain' only in v0.4.0 (framework probes arrive v0.5.0).
        entity: Optional callback returning a state snapshot dict for receipt context.

    Raises:
        TypeError: at decoration time, if `timeout_s <= 0`.
        DecorationTimeError (E010): at decoration time, if applied to a generator,
            async generator, or context manager.
        NotImplementedError: when a decorated function is called before LANE 2
            ships the runtime (this skeleton).

    Behavior on call (LANE 2 implementation):
        First call: blocks up to timeout_s, raises ActionPending on timeout
        with a resume URL. Returns the wrapped function's return value when
        a human approves. Raises ActionDeniedError on human deny. See plan
        line 60-69 for the full behavior contract.

    Example::

        from statis import gate

        @gate(action_name="send_money")
        def send_money(amount: int, recipient: str) -> dict:
            return stripe_transfer(amount, recipient)

        # First call blocks until human approves via signed URL.
        receipt = send_money(50, "alice@example.com")
    """
    # Validate timeout_s at decoration time (Q5 from prior eng review).
    if timeout_s <= 0:
        raise TypeError(
            f"@statis.gate(timeout_s={timeout_s}) — timeout_s must be > 0"
        )

    def decorator(fn: F) -> F:
        # Validate target shape at decoration time (D11 from prior eng review).
        # Generators / async generators are not supported v0.4.0 — fail loud + early
        # so misuse doesn't reach production.
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
        # Note: detecting context managers (classes with __enter__/__exit__) needs
        # to happen at the class level, not the function level. LANE 2 implementation
        # adds that check when it inspects callable targets more deeply.

        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            raise NotImplementedError(
                "@statis.gate runtime is implemented in LANE 2 of the setup-gstack "
                "plan. This is the v0.4.0 spine skeleton — package metadata + "
                "exports + decoration-time validation only. "
                "See: aniketkumar-setup-gstack-design-20260424-090306.md"
            )

        # Carry decoration metadata so tests + introspection can inspect the
        # contract without invoking the runtime.
        wrapper.__statis_gate__ = {  # type: ignore[attr-defined]
            "action_name": action_name,
            "mode": mode,
            "on_error": on_error,
            "timeout_s": timeout_s,
            "idempotency_key": idempotency_key,
            "runtime": runtime,
            "entity": entity,
        }
        return wrapper  # type: ignore[return-value]

    return decorator

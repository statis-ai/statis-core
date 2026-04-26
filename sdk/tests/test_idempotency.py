"""Lane 2 — idempotency-key resolution.

Three-mode contract from D10 in /plan-eng-review delta:
  string  → returned as-is
  callable → invoked with BoundArguments, must return str
  None    → SHA-256 hash fallback over (agent_id, action_name, args)

`kwargs_only` is the recommended ergonomic wrapper (DX9).
"""
from __future__ import annotations

import inspect

import pytest

from statis import kwargs_only
from statis._idempotency import hash_fallback, resolve_idempotency_key


def _bind(fn, *args, **kwargs) -> inspect.BoundArguments:
    return inspect.signature(fn).bind(*args, **kwargs)


def example(customer_id: str, amount: int, reason: str = "default") -> None:
    pass


def test_string_passes_through() -> None:
    bound = _bind(example, "cus_42", 100)
    assert (
        resolve_idempotency_key(
            user_supplied="my-key", agent_id="a", action_name="x", bound=bound
        )
        == "my-key"
    )


def test_callable_receives_bound_args() -> None:
    captured: list[inspect.BoundArguments] = []

    def custom(b: inspect.BoundArguments) -> str:
        captured.append(b)
        return "from-callable"

    bound = _bind(example, "cus_42", 100)
    result = resolve_idempotency_key(
        user_supplied=custom, agent_id="a", action_name="x", bound=bound
    )
    assert result == "from-callable"
    assert len(captured) == 1
    assert captured[0].arguments["customer_id"] == "cus_42"


def test_callable_must_return_string() -> None:
    bound = _bind(example, "cus_42", 100)
    with pytest.raises(TypeError):
        resolve_idempotency_key(
            user_supplied=lambda b: 12345,  # type: ignore[arg-type,return-value]
            agent_id="a",
            action_name="x",
            bound=bound,
        )


def test_none_falls_back_to_hash() -> None:
    bound = _bind(example, "cus_42", 100)
    a = resolve_idempotency_key(
        user_supplied=None, agent_id="agent-1", action_name="apply", bound=bound
    )
    b = resolve_idempotency_key(
        user_supplied=None, agent_id="agent-1", action_name="apply", bound=bound
    )
    assert a == b
    assert len(a) == 64  # SHA-256 hex


def test_hash_fallback_includes_agent_and_action() -> None:
    """Different agent → different key. Different action → different key."""
    bound = _bind(example, "cus_42", 100)
    a = hash_fallback("agent-1", "apply", bound)
    b = hash_fallback("agent-2", "apply", bound)
    c = hash_fallback("agent-1", "refund", bound)
    assert a != b
    assert a != c


def test_hash_fallback_excludes_self() -> None:
    """Instance-method `self` is excluded so two calls on different instances
    of the same class with the same args still dedup (D10)."""

    class Bot:
        def apply(self, x: int) -> None:
            pass

    bot_a = Bot()
    bot_b = Bot()
    sig = inspect.signature(Bot.apply)
    bound_a = sig.bind(bot_a, 5)
    bound_b = sig.bind(bot_b, 5)
    assert hash_fallback("agent-1", "apply", bound_a) == hash_fallback(
        "agent-1", "apply", bound_b
    )


def test_kwargs_only_picks_named_args() -> None:
    """`kwargs_only("customer_id", "amount")` ignores `reason` deliberately."""
    bound = _bind(example, "cus_42", 100, reason="retention")
    bound_other = _bind(example, "cus_42", 100, reason="goodwill")
    fn = kwargs_only("customer_id", "amount")
    assert fn(bound) == fn(bound_other)


def test_kwargs_only_different_amount_differs() -> None:
    fn = kwargs_only("customer_id", "amount")
    assert fn(_bind(example, "cus_42", 100)) != fn(_bind(example, "cus_42", 200))


def test_kwargs_only_requires_at_least_one_name() -> None:
    with pytest.raises(ValueError):
        kwargs_only()


def test_kwargs_only_unknown_arg_name_raises() -> None:
    fn = kwargs_only("nonexistent")
    with pytest.raises(ValueError):
        fn(_bind(example, "cus_42", 100))


def test_invalid_user_supplied_type_raises() -> None:
    bound = _bind(example, "cus_42", 100)
    with pytest.raises(TypeError):
        resolve_idempotency_key(
            user_supplied=12345,  # type: ignore[arg-type]
            agent_id="a",
            action_name="x",
            bound=bound,
        )

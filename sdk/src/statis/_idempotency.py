"""Idempotency-key resolution for the @statis.gate decorator.

Three modes, in priority order:

  1. Caller-supplied string ............... `idempotency_key="cust_42-2026-04-26"`
  2. Caller-supplied callable ............. `idempotency_key=kwargs_only("customer_id", "amount")`
                                            receives `inspect.BoundArguments`,
                                            returns string
  3. Hash fallback ........................ SHA-256 of (agent_id, action_name,
                                            canonical-args-JSON) — used when
                                            `idempotency_key=None`

Plan reference: D10 from /plan-eng-review delta:
  `idempotency_key: str | Callable[[BoundArguments], str] | None`
  `kwargs_only` is the recommended ergonomic wrapper

"Canonical args JSON" = sorted-key, compact `json.dumps(..., default=str)`
so non-JSON-native values (datetimes, UUIDs) participate without raising.
JCS RFC 8785 strict canonicalization arrives in Receipt v2 (Week 2 atomic
change); for v0.4.0 hash-fallback dedup, sorted-key JSON is sufficient
since the hash is opaque on both ends.
"""
from __future__ import annotations

import hashlib
import inspect
import json
from typing import Any, Callable, Optional


IdempotencyKey = Callable[[inspect.BoundArguments], str]


def kwargs_only(*names: str) -> IdempotencyKey:
    """Build an idempotency-key callable that hashes the named arguments.

    The most common pattern: an agent re-invokes a function with the same
    semantically-relevant arguments and we want both calls to dedup to the
    same action_id, even if other arguments (timestamps, request IDs)
    differ. `kwargs_only` extracts only the named arguments from the
    function's BoundArguments and returns a stable hash.

    Example::

        @gate(action_name="apply_discount",
              idempotency_key=kwargs_only("customer_id", "amount"))
        def apply_discount(customer_id, amount, reason, requested_at):
            ...
    """
    if not names:
        raise ValueError("kwargs_only() requires at least one argument name")
    selected = tuple(names)

    def _resolve(bound: inspect.BoundArguments) -> str:
        bound.apply_defaults()
        missing = [n for n in selected if n not in bound.arguments]
        if missing:
            raise ValueError(
                f"kwargs_only({', '.join(repr(n) for n in selected)}) — "
                f"argument(s) not bound: {missing}"
            )
        payload = {n: bound.arguments[n] for n in selected}
        return _sha256_canonical(payload)

    _resolve.__statis_kwargs_only__ = selected  # type: ignore[attr-defined]
    return _resolve


def hash_fallback(agent_id: str, action_name: str, bound: inspect.BoundArguments) -> str:
    """SHA-256 of (agent_id, action_name, canonical args JSON).

    Used when the caller does not supply `idempotency_key`. Tenant is NOT
    included — it's injected server-side. `self` is excluded for instance
    methods (D10).
    """
    bound.apply_defaults()
    args_for_hash = dict(bound.arguments)
    args_for_hash.pop("self", None)
    args_for_hash.pop("cls", None)
    return _sha256_canonical(
        {"agent_id": agent_id, "action_name": action_name, "args": args_for_hash}
    )


def resolve_idempotency_key(
    *,
    user_supplied: Optional[Any],  # str | Callable | None
    agent_id: str,
    action_name: str,
    bound: inspect.BoundArguments,
) -> str:
    """Apply the three-mode resolution and return the final key string."""
    if isinstance(user_supplied, str):
        return user_supplied
    if callable(user_supplied):
        result = user_supplied(bound)
        if not isinstance(result, str):
            raise TypeError(
                f"idempotency_key callable must return str, got {type(result).__name__}"
            )
        return result
    if user_supplied is None:
        return hash_fallback(agent_id, action_name, bound)
    raise TypeError(
        f"idempotency_key must be str | Callable | None, got {type(user_supplied).__name__}"
    )


def _sha256_canonical(payload: Any) -> str:
    """SHA-256 of sort-key compact JSON. `default=str` lets datetimes / UUIDs through."""
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()

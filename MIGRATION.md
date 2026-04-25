# Migrating to statis-ai v0.4.0

v0.4.0 introduces `@statis.gate` as the primary surface. The previous `StatisClient.execute()` API moves to `statis.advanced` for users who need the lower-level interface.

This guide covers two migration paths:

- **Path 1 — Minimum change.** Keep using `StatisClient.execute()`, just update the import. Five-minute migration.
- **Path 2 — Adopt the decorator.** Refactor your call sites to `@statis.gate`. More idiomatic, less boilerplate, but more code change.

Most teams want Path 1 first, Path 2 incrementally as you touch each call site.

---

## TL;DR

```bash
# Path 1: import swap, done.
sed -i.bak 's/from statis import StatisClient/from statis.advanced import StatisClient/g' \
  $(grep -rl "from statis import StatisClient" --include='*.py')

# Path 2: replace StatisClient.execute(...) blocks with @gate decorators.
# See "Path 2" section below.
```

GNU sed users (Linux): drop the `.bak` arg, use `sed -i ''` instead. macOS BSD sed needs the `.bak` arg or it errors.

---

## Path 1: Minimum change (recommended for first pass)

If your code looks like:

```python
from statis import StatisClient, ActionDeniedError, ActionEscalatedError

with StatisClient(api_key="st_...") as client:
    receipt = client.execute(action_type="...", parameters={...}, ...)
```

Change the import:

```python
from statis.advanced import StatisClient, ActionDeniedError, ActionEscalatedError

with StatisClient(api_key="st_...") as client:
    receipt = client.execute(action_type="...", parameters={...}, ...)
```

That's it. The behavior is unchanged. `StatisClient.execute()` still polls until the action terminates, still raises `ActionDeniedError` on policy deny, still raises `ActionEscalatedError` when a human needs to approve via the Console.

### Mechanical sed migration

```bash
# macOS BSD sed
sed -i.bak 's/from statis import StatisClient/from statis.advanced import StatisClient/g' \
  $(grep -rl "from statis import StatisClient" --include='*.py')

# Linux GNU sed
sed -i 's/from statis import StatisClient/from statis.advanced import StatisClient/g' \
  $(grep -rl "from statis import StatisClient" --include='*.py')
```

For more complex import lines (e.g., `from statis import StatisClient, ActionDeniedError`), this regex catches the prefix only. The trailing names re-export from `statis.advanced` too, but for clarity you may want to update them all.

### Deprecation shim

If you forget to update the import and run `from statis import StatisClient` after upgrading, you get a clear error:

```python
StatisDeprecationError: `from statis import StatisClient` was moved to
`from statis.advanced import StatisClient` in statis-ai v0.4.0.
Update your import. Migration guide: https://statis.dev/migrate/0.1-to-0.4
See https://statis.dev/errors/E012
```

`StatisDeprecationError` subclasses `ImportError`, so existing `try: from statis import StatisClient except ImportError` patterns degrade gracefully.

---

## Path 2: Adopt `@statis.gate`

The decorator is shorter, more readable, and the receipt is captured automatically. Adopt it incrementally — start with one call site, migrate the rest as you touch them.

### Before (v0.1.x propose/execute)

```python
from statis import StatisClient

with StatisClient(api_key="st_...") as client:
    receipt = client.execute(
        action_type="apply_discount",
        target={"entity_type": "account", "entity_id": "acct-42"},
        parameters={"discount_pct": 20},
        agent_id="csm-agent-v2",
        target_system="stripe",
    )
    # ... your logic that uses the receipt
```

### After (v0.4.0 decorator)

```python
from statis import gate

@gate(action_name="apply_discount")
def apply_discount(account_id: str, discount_pct: int) -> dict:
    return stripe_apply_discount(account_id, discount_pct)

# At call site:
result = apply_discount("acct-42", 20)
# `result` is whatever your function returns. Receipt is written automatically.
```

The decorator wraps the function once. Every call goes through the policy/approval/execution pipeline transparently. Your business logic at the call site is just a normal Python call.

### Parameter mapping

| v0.1.x `StatisClient.execute()` | v0.4.0 `@gate()` |
|---|---|
| `action_type` | `action_name` |
| `target_system` | `runtime` (currently `"plain"` only — framework probes v0.5.0) |
| `parameters` | passed as positional/keyword args to your function |
| `agent_id` | inferred from your `STATIS_API_KEY` (or set explicitly via `agent_id=` if needed) |
| `action_id` | use `idempotency_key` (auto-generated if omitted) |
| return value: `Receipt` | return value: your function's return value; receipt written async, fetchable via `/r/{tenant}/{receipt_id}` |

### Idempotency: the most common gotcha

v0.1.x: callers passed an explicit `action_id` to dedup retries.

v0.4.0: `idempotency_key` does the same job, but with two new shapes:

```python
# Caller-supplied string (simplest)
@gate(action_name="apply_discount", idempotency_key="acct-42-2026-04-25")
def apply_discount(...): ...

# Callable form (lets you derive the key from BoundArguments)
@gate(
    action_name="apply_discount",
    idempotency_key=lambda args: f"{args['account_id']}-{args['discount_pct']}",
)
def apply_discount(account_id, discount_pct): ...

# None (the default) — Statis derives the key as
# SHA-256(agent_id + action_kind + JCS-canonical(args)).
# Same args → same hash → same action_id → guaranteed dedup.
@gate(action_name="apply_discount")
def apply_discount(...): ...
```

The Callable form is the recommended pattern when you want a custom idempotency strategy. The default (hash-fallback) is correct for most cases — same args always hash to the same key.

---

## Error class reference

| v0.1.x error | v0.4.0 status | Notes |
|---|---|---|
| `StatisError` | unchanged | HTTP non-2xx from a reachable server |
| `ActionDeniedError` | unchanged + gains `error_code = "E005"` | Policy or human denied |
| `ActionEscalatedError` | unchanged | Human review required (operator console) |
| `ActionTimeoutError` | unchanged for `statis.advanced` users | Decorator users get `ActionPending` instead |
| `ActionDeferredError` | unchanged + gains `error_code = "E006"` | Policy DEFER (AARM R4) |
| `StatisActionDenied` | unchanged | Alternate denial path |
| `StatisActionEscalated` | unchanged | Alternate escalation path |

### New errors in v0.4.0

| Code | Class | When |
|---|---|---|
| E001 | `MissingAPIKeyError` | `STATIS_API_KEY` not set, no api_key passed |
| E002 | `InvalidAPIKeyError` | API rejected the key |
| E003 | `NetworkError` | API unreachable after retries (distinct from `StatisError`, which is HTTP non-2xx from a reachable server) |
| E004 | `ActionPending` | Sync decorator timeout exceeded — carries `action_id` + `resume_url` |
| E007 | `InvalidActionNameError` | `action_name` not registered for tenant + auto-create disabled |
| E008 | `IdempotencyConflictError` | Same idempotency_key with different args |
| E009 | `InvalidMockConfigError` | `STATIS_BASE_URL=mock://` misconfigured |
| E010 | `DecorationTimeError` | `@gate` applied to generator/async-gen target |
| E011 | `SignatureVerificationError` | Receipt's ed25519 signature failed verification |
| E012 | `StatisDeprecationError` | v0.1.x import path used (subclasses `ImportError`) |

Every error carries `error_code` (e.g., `e.error_code == "E001"`) and `doc_url` (e.g., `e.doc_url == "https://statis.dev/errors/E001"`). Search either in your logs and find the doc page directly.

---

## Edge cases / FAQ

### "I was passing `target_system="stripe"`. What replaces it?"

`target_system` was the v0.1.x adapter selector. v0.4.0 keeps adapters at the worker layer (server-side), so the SDK no longer needs to specify which adapter handles the action. Your `action_name` still routes to the right adapter via the same registry in `worker/execute.py`.

If you depended on overriding the adapter from the SDK, the `runtime=` parameter is the future hook (currently `"plain"` only; framework probes for CrewAI/LangGraph/Temporal land v0.5.0).

### "I was catching `ActionTimeoutError`. Should I switch to `ActionPending`?"

Yes if you're on the decorator. `ActionPending` carries the `resume_url` so your error handler can re-surface it to the operator (Slack, email, log). The class hierarchy: `ActionPending` is a separate error from `ActionTimeoutError`. `ActionTimeoutError` is kept for `statis.advanced` users on the propose/execute path.

### "What happens to `ActionEscalatedError` with the decorator?"

The decorator surface is built around the signed-URL approval flow. When a human approves via the URL, the decorator unblocks normally — no escalation error. `ActionEscalatedError` still fires for `statis.advanced` users whose policy routes to the operator console queue. If your decorator-protected action takes the escalation path, the URL surfaces in your terminal as usual; the ESCALATED state is invisible from the SDK's perspective.

### "Should I keep my old `examples/csm_demo.py` working?"

Old examples now live at `examples/legacy/`. They use `StatisClient.execute()` with the new `from statis.advanced import StatisClient` path. They still work as reference for the propose/execute pattern. Three new examples in `examples/` show the v0.4.0 decorator: `vanilla_demo.py`, `discount_demo.py`, `async_workaround.py`.

### "I want to upgrade my prod codebase but the team can't stop. How?"

Path 1 (sed import swap) is non-breaking — your existing code keeps working. Run the sed command, run your tests, deploy. Then move call sites to `@statis.gate` one at a time as you touch them. The two import paths coexist forever.

### "Does the deprecation shim ever go away?"

Not planned. `statis.advanced` is a permanent submodule for low-level access. The shim that catches `from statis import StatisClient` is for users who don't run the sed; it raises `StatisDeprecationError` with a pointer to this guide. You can keep using the v0.1.x patterns indefinitely if you want — Path 1 is fully supported.

---

## Got stuck?

- File a bug: [GitHub Issues](https://github.com/statis-ai/statis-core/issues/new?template=bug_report.yml)
- Ask a question: [GitHub Discussions](https://github.com/statis-ai/statis-core/discussions)
- Error code reference: [statis.dev/errors](https://statis.dev/errors)
- Plan + design context for v0.4.0: see [`README.md`](README.md)

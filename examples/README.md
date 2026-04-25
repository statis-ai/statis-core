# Examples

Three examples for the v0.4.0 `@statis.gate` decorator (the primary surface), plus legacy v0.1.x reference under [`legacy/`](legacy/).

## v0.4.0 (start here)

| File | What it shows | When to read it |
|---|---|---|
| [`vanilla_demo.py`](vanilla_demo.py) | Simplest case. `@gate` around a function that prints. No external deps. The README's quick-start uses this exact pattern. | Right after `pip install statis-ai`. |
| [`discount_demo.py`](discount_demo.py) | Production-shape. Custom `idempotency_key` Callable, `entity=` snapshot callback, full error taxonomy (ActionDenied / ActionPending / IdempotencyConflict / NetworkError). | When you're wrapping your first real agent function. |
| [`async_workaround.py`](async_workaround.py) | `@gate` inside async code via `asyncio.to_thread`. Cancellation, idempotency, FastAPI integration caveats. | If your agent runs in LangGraph / CrewAI / FastAPI / any async runtime. Native async support arrives v0.5.0. |

Each example has a `try/except NotImplementedError` block at the bottom — until LANE 2 ships the runtime, calling the decorated function raises a clear "spine skeleton" message pointing at the plan. Once LANE 2 lands, the same examples become live demos with no code changes.

## Run them

```bash
# Real cloud (after `statis init` issues your STATIS_API_KEY):
python examples/vanilla_demo.py

# In-process mock — no api key, no cloud calls, deterministic receipts:
STATIS_BASE_URL=mock:// python examples/vanilla_demo.py

# Mock with denials (for testing your error paths):
STATIS_BASE_URL=mock:// STATIS_MOCK_DECISION=deny python examples/vanilla_demo.py
```

## Legacy (v0.1.x reference)

[`legacy/`](legacy/) contains the v0.1.x propose/execute API examples (csm_demo, github_dogfood, retention_demo, webhook_receiver, crewai/). They still work — `StatisClient` lives at `statis.advanced.StatisClient` in v0.4.0. See [`legacy/README.md`](legacy/README.md) for what's in each, and [`../MIGRATION.md`](../MIGRATION.md) for the upgrade path.

## Subscription templates

[`subscription_templates/`](subscription_templates/) holds JSON templates for webhook subscriptions (billing pause, CSM escalate, sales pause). API-independent — they work in any version.

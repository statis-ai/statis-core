# Legacy examples (v0.1.x reference)

These examples use the v0.1.x `StatisClient.execute()` propose/execute API. They still work in v0.4.0 — `StatisClient` lives in [`statis.advanced`](../../sdk/src/statis/advanced.py), and the API endpoints they hit are unchanged.

For new code, prefer **`@statis.gate`** — see the v0.4.0 examples one directory up:

- [`../vanilla_demo.py`](../vanilla_demo.py) — simplest case, fake action, no external deps
- [`../discount_demo.py`](../discount_demo.py) — production-shape, idempotency_key Callable form
- [`../async_workaround.py`](../async_workaround.py) — `@gate` inside async code via `asyncio.to_thread`

Migration guide: [`../../MIGRATION.md`](../../MIGRATION.md).

## What's here

| File | What it demonstrates |
|---|---|
| [`csm_demo.py`](csm_demo.py) | Account state pack — events ingested, materialized state retrieved after each step. Optional webhook subscription + delivery trace. |
| [`github_dogfood.py`](github_dogfood.py) | Audit-only policy evaluation for GitHub actions (merge PR, create release, trigger workflow). Uses `StatisClient` from `statis.advanced`. |
| [`retention_demo.py`](retention_demo.py) | End-to-end churn retention: propose → policy → execute exactly once via MockStripeAdapter → SHA-256 receipt. The original 4-primitives walkthrough. |
| [`webhook_receiver.py`](webhook_receiver.py) | Minimal HTTP server that accepts webhook POSTs from the Statis worker. Useful for any version. |
| [`crewai/`](crewai) | CrewAI integration — agents wrapping Statis tools (push event, read state, history). Multi-crew demos and shadow-audit pattern. |

## Why preserve them?

1. They document real production patterns (CSM, retention, GitHub-action governance) that haven't changed.
2. The HTTP-level event/state/subscription API is the same in v0.4.0.
3. Existing tutorials, blog posts, and integrations link to specific filenames in this directory. Moving instead of deleting keeps those links alive (with a `legacy/` prefix update).

If you came here from a v0.1.x link, the file you wanted is here. If you're learning Statis fresh in 2026 or later, start with the v0.4.0 examples one directory up.

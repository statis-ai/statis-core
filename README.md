<p align="center">
  <a href="https://statis.dev">
    <img src="landing/public/logomark-transparent.png" alt="Statis" width="80" />
  </a>
</p>

<h1 align="center">Statis</h1>

<p align="center">
  <b>One decorator. Your agent asks permission before it touches production.</b>
</p>

<p align="center">
  <a href="https://statis.dev">Website</a>
  &nbsp;&middot;&nbsp;
  <a href="https://docs.statis.dev">Docs</a>
  &nbsp;&middot;&nbsp;
  <a href="https://github.com/statis-ai/statis-core/discussions">Discussions</a>
  &nbsp;&middot;&nbsp;
  <a href="https://x.com/statis_ai">Twitter</a>
</p>

<p align="center">
  <a href="https://github.com/statis-ai/statis-core/stargazers"><img src="https://img.shields.io/github/stars/statis-ai/statis-core?style=social" alt="GitHub Stars" /></a>
  &nbsp;
  <a href="https://github.com/statis-ai/statis-core/blob/main/LICENSE"><img src="https://img.shields.io/github/license/statis-ai/statis-core" alt="License" /></a>
  &nbsp;
  <a href="https://github.com/statis-ai/statis-core/commits/main"><img src="https://img.shields.io/github/last-commit/statis-ai/statis-core" alt="Last Commit" /></a>
  &nbsp;
  <a href="https://pypi.org/project/statis-ai/"><img src="https://img.shields.io/pypi/v/statis-ai?label=PyPI%20%7C%20statis-ai&color=blue" alt="PyPI" /></a>
</p>

<!--
  90-second demo GIF goes here. Recorded Day 5 with asciinema or terminalizer.
  Until then, this placeholder line keeps the section anchored.
  Asset path target: docs/images/statis-90s-demo.gif
-->
<p align="center">
  <em>(90-second demo GIF — recorded Day 5, asset at <code>docs/images/statis-90s-demo.gif</code>)</em>
</p>

```python
from statis import gate

@gate(action_name="send_money")
def send_money(amount, recipient):
    transfer(amount, recipient)

send_money(50, "alice@example.com")  # blocks until a human approves via signed URL
```

```bash
pip install statis-ai
statis init       # opens browser, registers tenant, copies STATIS_API_KEY to clipboard
python try.py     # decorator fires, URL prints, you click approve, terminal unblocks
```

**Three minutes from cold install to your first approved action.**

---

## What is Statis?

AI agents need to act on the world. Trigger a DAG. Apply a discount. Refund a charge. Modify a record. Without a governance layer, those actions are invisible, unauditable, and irreversible.

Statis is the layer between your agents and your production systems. One decorator wraps any function the agent calls. The first call doesn't execute. Statis returns a signed approval URL. A human approves in the browser. The function runs. A cryptographically-signed receipt is written to a tamper-evident ledger.

**The result:** every agent action has a paper trail. Who proposed it. What the policy said. Who approved it. Exactly what was executed. A hash you can verify offline.

```
agent calls send_money(50, "alice")
    │
    ▼
@statis.gate intercepts
    │
    ▼
POST /actions             ← contract registered, idempotency dedup
    │  status: PENDING
    ▼
signed approval URL printed in agent terminal
    │
    ▼  human clicks Approve in browser (~30s)
    │
    ▼
underlying function executes
    │
    ▼
ed25519-signed receipt written to ledger
    │
    ▼
agent terminal unblocks with the function's return value
```

After three identical approvals in 48h, Statis offers to write a policy rule for you. Auto-approve future matching actions. You stay in the receipt loop. The cumulative paper trail is what a hand-rolled Slack-button wrapper can't reconstruct.

---

## Try it in 3 minutes

### 1. Install

```bash
pip install statis-ai
```

### 2. Get an API key (one command)

```bash
statis init
```

Opens a browser to the signup page. Email-only, magic-link verification. Your `STATIS_API_KEY` is auto-issued, copied to your clipboard, and ready to paste into your env. Press `Y` when prompted about anonymous usage telemetry (or skip — `STATIS_TELEMETRY=0` opts out forever).

### 3. Hello world

```python
# try.py
from statis import gate

@gate(action_name="send_money")
def send_money(amount, recipient):
    print(f"transferred ${amount} to {recipient}")

send_money(50, "alice@example.com")
```

```bash
export STATIS_API_KEY=<from-statis-init>
python try.py
```

Your terminal prints:

```
[statis] action_kind 'send_money' pending approval.
[statis] approval URL: https://statis.dev/a/01HXJ4KZ7Q9F0WTYBM/?sig=ed25519...
[statis] expires in 4:59 — waiting...
[statis] .. ..
[statis] approved by you@example.com at 14:32:18Z
[statis] executing send_money(50, 'alice@example.com')...
transferred $50 to alice@example.com
[statis] done. Receipt: https://statis.dev/r/your-tenant/019638e5-3f02
```

### 4. Try the demo without writing any code

```bash
statis demo
```

Spawns a fake `transfer_funds(50, "alice")` decorated with `@statis.gate`. Mock cloud runs in-process. Browser opens to a local approval page. You click Approve. Terminal unblocks. **No api key required.** Whole experience: ~30 seconds.

---

## The decorator

### Public API

```python
@gate(
    action_name: str,                   # required — semantic identifier policies match
    mode: Literal["sync"] = "sync",     # async lands v0.5.0 (see below)
    on_error: Literal["fail_closed", "fail_open"] = "fail_closed",
    timeout_s: int = 300,               # decorator-wait timeout (sync only)
    idempotency_key: str | Callable | None = None,
    runtime: Literal["plain"] = "plain",  # CrewAI/LangGraph/Temporal probes v0.5.0
    entity: Callable[[], dict] | None = None,
)
def your_function(...): ...
```

**Defaults are opinionated.** `fail_closed` on API down means an unreachable Statis blocks the action. `timeout_s=300` means the decorator waits up to 5 minutes for human approval before raising `ActionPending` (which carries the resume URL — re-running the agent with the same idempotency key picks up where it left off).

**Idempotency.** `idempotency_key` is the dedup boundary. Pass a string, or a callable that receives `BoundArguments` and returns a string. None falls back to `SHA-256(agent_id, action_kind, JCS-canonical-args)`. Same key + same args → same `action_id`, no double-charge.

### Errors carry stable codes

Every Statis exception has an `error_code` and a `doc_url`. Search the code in your logs and find the doc page directly.

| Code | Class | Trigger |
|---|---|---|
| E001 | `MissingAPIKeyError` | `STATIS_API_KEY` not set |
| E002 | `InvalidAPIKeyError` | API rejected the key |
| E003 | `NetworkError` | API unreachable after retries |
| E004 | `ActionPending` | Sync timeout exceeded, action awaits human |
| E005 | `ActionDeniedError` | Human or policy denied |
| E006 | `ActionDeferredError` | Policy deferred (AARM R4) |
| E007 | `InvalidActionNameError` | `action_name` not registered |
| E008 | `IdempotencyConflictError` | Same key, different args |
| E009 | `InvalidMockConfigError` | `STATIS_BASE_URL=mock://` misconfigured |
| E010 | `DecorationTimeError` | Generator/async-gen target |
| E011 | `SignatureVerificationError` | Receipt signature invalid |
| E012 | `StatisDeprecationError` | v0.1.x import path used |

Full reference: [statis.dev/errors](https://statis.dev/errors).

### Using `@gate` inside async code (v0.4.0 workaround)

Native async (`async def` decorator targets) ships v0.5.0. Until then, wrap a sync function in a thread:

```python
import asyncio
from statis import gate

@gate(action_name="send_email")
def send_email_sync(to, subject, body):
    smtp_send(to, subject, body)

# In your async handler:
async def my_async_handler(...):
    # asyncio.to_thread runs the sync gate-protected function in a thread pool.
    # The event loop stays free to serve other requests during the approval window.
    return await asyncio.to_thread(send_email_sync, "alice@x.com", "hi", "test")
```

**Caveats.**
- Don't call `@gate`-protected sync functions directly from a single-threaded event loop (FastAPI sync route, blocking handler) — the entire app freezes until approval. Use `asyncio.to_thread`.
- Cancellation: when the event loop cancels the awaiting coroutine, the underlying gate call continues until URL TTL — the receipt records what happened. Idempotency keys protect against double-execution if the caller retries.
- Native async (`async def` targets, real cancellation propagation) ships v0.5.0. Until then, sync-via-thread is the blessed pattern.

Working example: [`examples/async_workaround.py`](examples/async_workaround.py).

### Local dev with no cloud calls

```bash
export STATIS_BASE_URL=mock://
python try.py     # auto-approves after 100ms, returns deterministic receipt
```

The mock transport runs entirely in-process. No api key needed. Auto-approves by default. Configurable:

```bash
export STATIS_MOCK_DECISION=approve     # approve | deny | escalate
export STATIS_MOCK_DELAY_MS=100         # simulated approval delay
export STATIS_MOCK_PATTERN_DENY="deny_*"  # action names matching glob auto-deny
```

Receipts are real-shape — same JSON structure as cloud receipts, so test assertions on receipt fields work identically when you switch back to the real API.

---

## Architecture

```
agent
  │
  ▼
@statis.gate                ← decorator (sdk/src/statis/decorator.py)
  │  inspect.BoundArguments → idempotency_key
  │  JCS-canonical args hash
  ▼
POST /actions               ← Action Contract (sdk/src/statis/client.py)
  │  agent_identity_snapshot frozen at creation (audit-trail integrity)
  │  status: PENDING / APPROVED / DENIED / ESCALATED / DEFERRED
  ▼
GET /a/{action_id}?sig=...  ← signed approval URL
  │  CSRF-protected POST /a/{id}/decision returns DECISION RECEIPT
  │  in-place page transformation (no nav, ~200ms)
  ▼
Execution Worker            ← exactly-once (api/app/models/execution_lock.py)
  │  adapter.execute(action)
  │    ├─ stripe       → MockStripeAdapter (built-in)
  │    ├─ airflow      → AirflowAdapter
  │    ├─ salesforce   → SalesforceAdapter
  │    ├─ zendesk      → ZendeskAdapter
  │    └─ hubspot      → HubSpotAdapter
  ▼
Receipt written             ← ed25519-signed, append-only
  GET /r/{tenant}/{receipt_id}
  CHAIN INTACT badge + offline verify CLI ship Week 2 (Receipt v2)
```

Every action lifecycle stage is observable. Every decision is logged. Every execution produces a signed receipt. The chain links every receipt for a tenant from genesis forward.

---

## API Reference

### Actions & Approval

| Endpoint | Description |
|---|---|
| `POST /actions` | Propose an action (called by the SDK / decorator) |
| `GET /actions/{action_id}` | Get action status |
| `GET /actions/{action_id}/similar?window=48h&limit=3` | Prior matching approvals (powers graduation audit panel) |
| `POST /actions/{action_id}/evaluate` | Run policy evaluation → APPROVED / DENIED / ESCALATED / DEFERRED |
| `GET /a/{action_id}?sig=...` | Public signed-URL approval page (render-only) |
| `POST /a/{action_id}/decision` | Submit approve/deny via signed URL (CSRF-protected) |
| `GET /escalations` | List ESCALATED actions (operator console) |

### Agents

| Endpoint | Description |
|---|---|
| `POST /agents` | Register an agent (idempotent) |
| `GET /agents` | List agents for the tenant |
| `GET /agents/{agent_id}/identity` | Identity card data (name, agent_class, recent counts) |

### Receipts

| Endpoint | Description |
|---|---|
| `GET /receipts/{action_id}` | Fetch the tamper-evident receipt |
| `GET /r/{tenant_id}/{receipt_id}` | Public-readable receipt page |

### Events & State

| Endpoint | Description |
|---|---|
| `POST /events` | Ingest events (idempotent by `event_id`) |
| `GET /state/{entity_type}/{entity_id}` | Current materialized state |
| `GET /state/{entity_type}/{entity_id}/at?rev=N` | Time-travel to revision N |

### Policy & Subscriptions

| Endpoint | Description |
|---|---|
| `POST /policies` | Apply / update policy rules (`statis policy apply policies.yaml`) |
| `POST /subscriptions` | Subscribe to entity state changes (webhook) |
| `GET /deliveries?entity_type=&entity_id=` | Webhook delivery status |

---

## CLI

```
statis init                Register a tenant + issue an api_key (browser flow)
statis demo                Run the no-key local demo
statis apply <yaml>        Upsert policy rules from YAML
statis diff <yaml>         Show what would change without writing
statis simulate ...        Test policy evaluation against fixtures
statis verify <receipt>    Offline verify a receipt's signature + chain (Q2)
```

`statis init` and `statis demo` are v0.4.0. Verb-group reorganization (`statis policy apply`, etc.) lands v1.0 with deprecation aliases.

For CI: don't run `statis init` non-interactively. Set `STATIS_API_KEY` in your secret store and the SDK reads it directly.

---

## Console

The Statis Console is a Next.js UI for inspecting entities and managing escalations.

**Account Inspector** — search any entity by type + ID, then explore:
- **State** — current materialized state with provenance
- **Timeline** — full append-only event log
- **Diff** — state changes between revisions
- **Deliveries** — webhook delivery status and retry history
- **Actions** — all action contracts with lifecycle status
- **Receipt** — decision, conditions evaluated (pass/fail), entity state snapshot, execution result, ed25519-signed hash

**Escalation Queue** — tenant-wide view of ESCALATED actions. Inspect the proposal, approve or reject with a reviewer note. Approved actions are picked up by the worker automatically.

**Public approval surfaces** (v0.4.0 new) live at `/a/{action_id}` (signed URL approval page) and `/r/{tenant}/{receipt}` (receipt page). Anyone with the signed URL can approve; the page itself does not require login.

---

## Adapters

Adapters connect the execution worker to external systems. Five are included:

| Adapter | `target_system` | Handles |
|---|---|---|
| `MockStripeAdapter` | `stripe` | `retention_offer`, `apply_discount` |
| `AirflowAdapter` | `airflow` | `airflow_dag_trigger` (Airflow REST API v1) |
| `SalesforceAdapter` | `salesforce` | `salesforce_update_record`, `salesforce_create_record` (REST v57) |
| `ZendeskAdapter` | `zendesk` | `zendesk_create_ticket`, `zendesk_update_ticket` (REST v2) |
| `HubSpotAdapter` | `hubspot` | `hubspot_update_contact`, `hubspot_create_deal` (CRM API v3) |

All adapters are idempotent — `action_id` is used as the external system's idempotency key.

**Adapter config via env vars:**

| Adapter | Env vars |
|---|---|
| Airflow | `AIRFLOW_BASE_URL`, `AIRFLOW_USERNAME`, `AIRFLOW_PASSWORD` |
| Salesforce | `SALESFORCE_INSTANCE_URL`, `SALESFORCE_ACCESS_TOKEN` |
| Zendesk | `ZENDESK_SUBDOMAIN`, `ZENDESK_EMAIL`, `ZENDESK_API_TOKEN` |
| HubSpot | `HUBSPOT_ACCESS_TOKEN` |

To add a new adapter:

```python
from app.adapters.base import BaseAdapter, ExecutionResult

class MyAdapter(BaseAdapter):
    def execute(self, action) -> ExecutionResult:
        # action.action_id  — use as idempotency key
        # action.parameters — whatever the agent proposed
        return ExecutionResult(success=True, result={"id": "..."})
```

Register it in `worker/execute.py`:

```python
ADAPTERS = {
    ...,
    "my_system": MyAdapter(),
}
```

---

## Migrating from v0.1.x

v0.4.0 introduces `@statis.gate` as the primary surface. The previous `StatisClient.execute()` API moves to `statis.advanced` for users who need the lower-level API.

**Mechanical migration:**

```bash
sed -i.bak 's/from statis import StatisClient/from statis.advanced import StatisClient/g' $(grep -rl "from statis import StatisClient" --include='*.py')
```

(macOS BSD sed needs the `.bak` arg; on GNU sed use `-i ''`.)

For the typical case — wrapping an agent's destructive function — switching to the decorator is shorter than the `client.execute()` boilerplate. Full migration walkthrough including idempotency_key conversion, error class renames, and edge cases: [`MIGRATION.md`](MIGRATION.md).

---

## TypeScript

`statis-ai` on npm currently ships at v0.1.x — the propose/execute API. The Python `@gate` decorator does not translate cleanly to TS (different decorator semantics, async-by-default, no Python-style stable `@`-syntax). A TS-native equivalent (likely a wrapper function, not a decorator) ships v0.5.0.

Until then, JS/TS users have two paths: (1) call the v0.1.x `StatisClient.execute()` directly per the npm docs, or (2) use the Python decorator from a co-located Python service via HTTP/IPC.

---

## Tech Stack

- **Backend:** Python 3.11 · FastAPI · SQLAlchemy · Alembic · PostgreSQL
- **Worker:** Python daemon · psycopg3 · `SKIP LOCKED` for concurrent workers
- **Console:** Next.js 15 · React 19 · Tailwind CSS · TypeScript
- **Python SDK (v0.4.0):** `statis-ai` on PyPI · httpx · hatchling · type stubs included
- **TypeScript SDK (v0.1.x):** `statis-ai` on npm · zero runtime deps · native fetch (Node 18+) · v0.5.0 brings parity
- **Receipts:** ed25519 signed (AARM R5) · per-tenant pubkey at `/.well-known/aarm-pubkey` · chain integrity Week 2 (Receipt v2) · offline verify CLI Q2
- **Docs:** Mintlify (`docs/`)
- **Tests:** pytest · testcontainers[postgres] · respx · Playwright (console smoke)

---

## Roadmap

- **v0.4.0 (now)** — `@statis.gate`, signed-URL approval, ed25519 receipts, policy graduation, statis init, statis demo
- **v0.5.0 (Week 2)** — native async (`async def` targets), CrewAI/LangGraph/Temporal runtime probes, `on_error="queue"` SQLite durable queue, Slack approval channel, Receipt v2 (chain integrity)
- **v1.0** — verb-group CLI reorganization, full TypeScript SDK with TS-native API, formal SLA + deprecation policy

---

## Contributing

Run tests:

```bash
cd api && python -m pytest tests/unit/ -v
cd sdk && python -m pytest tests/ -v
cd console && npm run test
```

Bug reports and feature requests: [GitHub Issues](https://github.com/statis-ai/statis-core/issues). General questions and integration help: [GitHub Discussions](https://github.com/statis-ai/statis-core/discussions).

---

## License

MIT — see [LICENSE](LICENSE) for details.

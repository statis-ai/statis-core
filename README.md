<p align="center">
  <a href="https://statis.dev">
    <img src="landing/public/logomark-transparent.png" alt="Statis" width="80" />
  </a>
</p>

<h1 align="center">Statis</h1>

<p align="center">
  <b>Agent execution infrastructure.</b><br>
  Propose → Evaluate → Execute once → Receipt.
</p>

<p align="center">
  <a href="https://statis.dev">Website</a>
  &nbsp;&middot;&nbsp;
  <a href="https://docs.statis.dev">Docs</a>
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
  &nbsp;
  <a href="https://www.npmjs.com/package/statis-ai"><img src="https://img.shields.io/npm/v/statis-ai?label=npm%20%7C%20statis-ai&color=red" alt="npm" /></a>
</p>

---

## What is Statis?

AI agents need to act on the world — trigger a DAG, apply a discount, modify a record. Without a governance layer, those actions are invisible, unauditable, and irreversible.

Statis is the layer between your agents and your production systems. Every agent action goes through four primitives:

| Primitive | What it does |
|---|---|
| **Action Contract** | Agent proposes an action before executing it |
| **Policy Engine** | Deterministic rules evaluate the proposal — APPROVED, DENIED, or ESCALATED |
| **Execution Guarantee** | Distributed lock ensures the action executes exactly once |
| **Receipt (Ledger)** | SHA-256 tamper-evident receipt written at execution — immutable audit trail |

The result: every agent action has a paper trail. Who proposed it, what the policy said, who (or what) approved it, exactly what was executed, and a hash you can verify.

---

## SDKs

### Python

```bash
pip install statis-ai
```

```python
from statis import StatisClient, ActionDeniedError, ActionEscalatedError

with StatisClient(api_key="st_...") as client:
    try:
        receipt = client.execute(
            action_type="retention_offer",
            target={"entity_type": "account", "entity_id": "acct-42"},
            parameters={"discount_pct": 20},
            agent_id="csm-agent-v2",
            target_system="stripe",
        )
        print(f"Executed — receipt: {receipt.receipt_id}, hash: {receipt.hash}")

    except ActionDeniedError as e:
        print(f"Policy denied: {e.receipt.rule_id}")

    except ActionEscalatedError as e:
        # A human must approve in the Console before execution proceeds
        print(f"Escalated for human review — action_id: {e.action_id}")
```

### TypeScript

```bash
npm install statis-ai
```

```typescript
import { StatisClient, ActionDeniedError, ActionEscalatedError } from "statis-ai";

const client = new StatisClient({ api_key: "st_..." });

try {
  const receipt = await client.execute({
    action_type: "retention_offer",
    target: { entity_type: "account", entity_id: "acct-42" },
    parameters: { discount_pct: 20 },
    agent_id: "csm-agent-v2",
    target_system: "stripe",
  });
  console.log(`Executed — receipt: ${receipt.receipt_id}, hash: ${receipt.hash}`);

} catch (e) {
  if (e instanceof ActionDeniedError) console.log(`Policy denied: ${e.receipt.rule_id}`);
  if (e instanceof ActionEscalatedError) console.log(`Escalated: ${e.action_id}`);
}
```

`execute()` is a single blocking call: propose → evaluate → poll until done → return receipt. The SDK raises typed errors for every terminal state.

---

## Architecture

```
Agent
  │
  ▼
POST /actions              ← Action Contract (P1)
  │
  ▼
POST /actions/{id}/evaluate ← Policy Engine (P2)
  │                            deterministic rules → APPROVED / DENIED / ESCALATED
  ├─ ESCALATED ──────────────► Console Escalation Queue
  │                            human approves / rejects
  │
  ▼
Execution Worker           ← Execution Guarantee (P3)
  │                            distributed lock → exactly-once
  │  adapter.execute(action)
  │    ├─ stripe      → MockStripeAdapter
  │    ├─ airflow     → AirflowAdapter    (Airflow REST API v1)
  │    ├─ salesforce  → SalesforceAdapter (Salesforce REST API)
  │    ├─ zendesk     → ZendeskAdapter    (Zendesk REST API v2)
  │    └─ hubspot     → HubSpotAdapter    (HubSpot CRM API v3)
  │
  ▼
Receipt written            ← Ledger (P4)
  SHA-256 hash of canonical fields
  includes: conditions evaluated, entity state snapshot, reviewer (if escalated)
```

---

## Quickstart

**Prerequisites:** PostgreSQL running locally.

```bash
git clone https://github.com/statis-ai/statis-core.git
cd statis-core/api
pip install -r requirements.txt
python -m alembic upgrade head
python scripts/seed_admin.py   # outputs your STATIS_API_KEY
```

Start all three services:

```bash
# Terminal 1 — API
cd api && fastapi run app/main.py

# Terminal 2 — Console
cd console && npm install && npm run dev

# Terminal 3 — Execution worker
python -m worker.execute
```

Run the end-to-end demo:

```bash
STATIS_API_KEY=<your-key> python examples/retention_demo.py
```

The demo proposes a retention offer for `acct-42`, evaluates it against the `churn_retention_v1` policy, executes via the mock Stripe adapter, and prints the receipt with its SHA-256 hash.

---

## API Reference

### Events & State

| Endpoint | Description |
|---|---|
| `POST /events` | Ingest events (idempotent by `event_id`) |
| `GET /events?entity_type=&entity_id=` | Query event log for an entity |
| `GET /state/{entity_type}/{entity_id}` | Current materialized state |
| `GET /state/{entity_type}/{entity_id}/at?rev=N` | Time-travel to revision N |

### Actions & Policy

| Endpoint | Description |
|---|---|
| `POST /actions` | Propose an action |
| `GET /actions/{action_id}` | Get action status |
| `GET /actions?entity_type=&entity_id=` | List actions for an entity |
| `POST /actions/{action_id}/evaluate` | Run policy evaluation → APPROVED / DENIED / ESCALATED |
| `POST /actions/{action_id}/approve` | Human approves an ESCALATED action |
| `POST /actions/{action_id}/reject` | Human rejects an ESCALATED action |
| `GET /escalations` | List all ESCALATED actions (tenant-wide queue) |

### Receipts & Delivery

| Endpoint | Description |
|---|---|
| `GET /receipts/{action_id}` | Fetch the tamper-evident receipt |
| `POST /subscriptions` | Subscribe to entity state changes (webhook) |
| `GET /deliveries?entity_type=&entity_id=` | Webhook delivery status |

---

## Console

The Statis Console is a Next.js UI for inspecting entities and managing escalations.

**Account Inspector** — search any entity by type + ID, then explore:
- **State** — current materialized state with provenance
- **Timeline** — full append-only event log
- **Diff** — state changes between revisions
- **Deliveries** — webhook delivery status and retry history
- **Actions** — all action contracts with lifecycle status
- **Receipt** — decision, conditions evaluated (pass/fail), entity state snapshot, execution result, SHA-256 hash

**Escalation Queue** — tenant-wide view of ESCALATED actions. Inspect the proposal, approve or reject with a reviewer note. Approved actions are picked up by the worker automatically.

---

## Adapters

Adapters connect the execution worker to external systems. Five are included:

| Adapter | `target_system` | Handles |
|---|---|---|
| `MockStripeAdapter` | `stripe` | `retention_offer`, `apply_discount` |
| `AirflowAdapter` | `airflow` | `airflow_dag_trigger` — Airflow REST API v1, `action_id` as `dag_run_id` |
| `SalesforceAdapter` | `salesforce` | `salesforce_update_record`, `salesforce_create_record` — Salesforce REST API v57 |
| `ZendeskAdapter` | `zendesk` | `zendesk_create_ticket`, `zendesk_update_ticket` — Zendesk REST API v2 |
| `HubSpotAdapter` | `hubspot` | `hubspot_update_contact`, `hubspot_create_deal` — HubSpot CRM API v3 |

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

## Policy Engine

Policies are rows in the `policy_rules` table. Conditions are evaluated as a conjunction (all must pass).

Six rules are seeded:

```
churn_retention_v1
  action_type: retention_offer
  conditions: { churn_risk: true, min_ltv: 1000, no_discount_days: 30 }
  decision: APPROVED

airflow_dag_trigger_v1
  action_type: airflow_dag_trigger
  conditions: { operator_approved: true }
  decision: APPROVED

salesforce_update_record_v1 / salesforce_create_record_v1
  conditions: { operator_approved: true }
  decision: APPROVED

zendesk_create_ticket_v1 / zendesk_update_ticket_v1
  conditions: { operator_approved: true }
  decision: APPROVED

hubspot_update_contact_v1 / hubspot_create_deal_v1
  conditions: { operator_approved: true }
  decision: APPROVED
```

No match → DENIED by default (fail-closed).

---

## Tech Stack

- **Backend:** Python 3.11 · FastAPI · SQLAlchemy · Alembic · PostgreSQL
- **Worker:** Python daemon · psycopg3 · `SKIP LOCKED` for concurrent workers
- **Console:** Next.js 15 · React 19 · Tailwind CSS · TypeScript
- **Python SDK:** `statis-ai` on PyPI · httpx · hatchling
- **TypeScript SDK:** `statis-ai` on npm · zero runtime deps · native fetch (Node 18+)
- **Docs:** Mintlify (`docs/`) — guides, SDK reference, API reference
- **Tests:** pytest · testcontainers[postgres] · respx — 149 unit + 16 integration tests

---

## License

MIT — see [LICENSE](LICENSE) for details.

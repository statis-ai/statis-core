# Statis — Build Status

> **Keep this file current.** Update it whenever a feature ships, a section changes, or a milestone closes.
>
> Last updated: 2026-03-12

---

## What Statis Is

Agent execution infrastructure. The layer between AI agents and production systems.

**Core promise:** Shared state in. Governed, receipted action out.

**Four primitives:**
1. **Action Contract** — Agents propose before they execute
2. **Policy Engine** — Deterministic rules evaluate proposals
3. **Execution Guarantee** — Distributed lock ensures exactly-once execution
4. **Ledger (Receipt)** — SHA-256 tamper-evident receipt written at execution

---

## Backend — `api/`

### Status: ✅ Complete (all four primitives + escalation flow)

| Feature | Status | Key Files |
|---|---|---|
| Append-only event log (idempotent, deterministic ordering) | ✅ | `api/app/repositories/events.py` |
| State materialization (9 reducers, SHA-256 hashing, optimistic concurrency) | ✅ | `api/app/reducers/` |
| Push delivery (webhook subscriptions, dedup, exponential backoff, SKIP LOCKED) | ✅ | `worker/` |
| Time-travel queries (`GET /state/.../at?rev=N`) | ✅ | `api/app/api/routes/` |
| Multi-tenancy + RBAC-lite (role filtering + state field redaction) | ✅ | `api/app/rbac.py` |
| Poison-pill quarantine (3 failures → quarantine entity) | ✅ | `api/app/models/quarantine.py` |
| Action Contract (P1) — `POST /actions`, `GET /actions/{id}` | ✅ | `api/app/models/action_contract.py` |
| List actions by entity — `GET /actions?entity_type=&entity_id=` | ✅ | `api/app/api/routes/actions.py` |
| Policy Engine (P2) — `POST /actions/{id}/evaluate` | ✅ | `api/app/policy/evaluator.py` |
| Conditions evaluated stored on receipt | ✅ | `receipts.conditions_evaluated` JSONB |
| Entity state snapshot stored on receipt | ✅ | `receipts.entity_state_snapshot` JSONB |
| `operator_approved` condition type (caller attestation via `action.context`) | ✅ | `api/app/policy/evaluator.py` |
| Execution Guarantee (P3) — distributed lock, exactly-once | ✅ | `api/app/models/execution_lock.py`, `worker/execute.py` |
| Ledger / Receipt (P4) — `GET /receipts/{action_id}` | ✅ | `api/app/models/receipt.py` |
| Escalation flow — `GET /escalations`, `POST /actions/{id}/approve`, `POST /actions/{id}/reject` | ✅ | `api/app/api/routes/actions.py` |
| Escalation audit log — `escalation_reviews` table | ✅ | `api/app/models/escalation_review.py` |
| Post-escalation receipt tracing — `reviewer_id` injected into `execution_result` | ✅ | `worker/execute.py` |

### DB Schema — 15 migrations

| Migration | Description |
|---|---|
| 0001–0004 | events, entity_state, subscriptions, deliveries |
| 0005–0007 | multi-tenancy, api_keys (created_at, role/agent_id) |
| 0008 | quarantine table |
| 0009 | action_contracts table |
| 0010 | policy_rules table + seed `churn_retention_v1` |
| 0011 | receipts table |
| 0012 | execution_locks table |
| 0013 | receipts: add `conditions_evaluated` + `entity_state_snapshot` JSONB columns |
| 0014 | seed `airflow_dag_trigger_v1` policy rule |
| 0015 | escalation_reviews table |

> ⚠️ Migrations 0013–0015 must be run against the deployed DB (`alembic upgrade head`)

### Tests

- **123 unit tests** (`api/tests/unit/`) — all passing
- **16 integration tests** using `testcontainers[postgres]`
- Notable suites: `test_policy_evaluator.py` (14 pure unit, no DB), `test_receipt_hash.py` (8 hash property tests), `test_airflow_adapter.py` (7 tests)

### Key Bug Fixes
- **psycopg3 `rowcount` bug** — `INSERT ... ON CONFLICT DO NOTHING` returns unreliable rowcount with psycopg3. Fixed in `worker/execute.py` `_try_acquire_lock` using `.returning(ExecutionLock.action_id)` + `fetchone() is not None`

---

## Worker — `worker/`

### Status: ✅ Complete

- `worker/execute.py` — polls `APPROVED` actions, acquires distributed lock, calls adapter, writes receipt
- `worker/__init__.py` — package entrypoint; run with `python -m worker.execute`
- Three-transaction pattern: T1 (acquire lock + EXECUTING) → T2 (adapter call) → T3 (receipt + COMPLETED/FAILED + release lock)
- Post-escalation: queries `escalation_reviews` by `action_id` before execution; injects reviewer metadata into `execution_result`

**Adapter registry:**

| Key | Adapter | Handles |
|---|---|---|
| `"stripe"` | `MockStripeAdapter` | `retention_offer`, `apply_discount` (50ms fake latency) |
| `"airflow"` | `AirflowAdapter` | `airflow_dag_trigger` (real Airflow REST API v1) |

---

## Adapters — `api/app/adapters/`

### MockStripeAdapter — `stripe_mock.py`
- Handles `retention_offer` + `apply_discount`
- Returns `{"charge_id": "ch_mock_{action_id[:8]}"}` in `execution_result`
- 50ms simulated latency

### AirflowAdapter — `airflow.py`
- Triggers DAG runs via Airflow Stable REST API v1 (`POST /api/v1/dags/{dag_id}/dagRuns`)
- `action_id` used as `dag_run_id` — idempotency key (Airflow 409 → success, not error)
- `execution_result` contains `{dag_run_id, dag_id, state, logical_date}` for full receipt traceability
- Config via env vars: `AIRFLOW_BASE_URL`, `AIRFLOW_USERNAME`, `AIRFLOW_PASSWORD`
- `parameters.dag_id` required; `parameters.conf` and `parameters.logical_date` optional
- 7 unit tests via in-process fake HTTP server (no external deps)

---

## Policy Engine — `api/app/policy/evaluator.py`

### Status: ✅ Complete

Pure `PolicyEvaluator` — zero DB imports, fully unit-testable.

**Seeded rules:**

| Rule ID | Action Type | Conditions | Decision |
|---|---|---|---|
| `churn_retention_v1` | `retention_offer` | `churn_risk=true`, `min_ltv=1000`, `no_discount_days=30` | APPROVED |
| `airflow_dag_trigger_v1` | `airflow_dag_trigger` | `operator_approved=true` | APPROVED |

**Condition keys:**

| Key | Source | Description |
|---|---|---|
| `churn_risk` | `entity_state` | Bool/string truthy check |
| `min_ltv` | `entity_state` | Float threshold — `ltv >= value` |
| `no_discount_days` | `entity_state` + event history | No discount within N days |
| `operator_approved` | `action.context` | Caller attestation — not entity state |

---

## Escalation Flow — Full Stack

### Status: ✅ Complete

**The story:** Policy evaluates action → returns ESCALATED → human reviews in Console → approves or rejects → if approved, worker executes normally → receipt records reviewer identity.

**Backend:**
- `GET /escalations` — tenant-scoped queue of all ESCALATED actions (ordered oldest first)
- `POST /actions/{id}/approve` — ESCALATED → APPROVED + writes `escalation_reviews` row; 409 if not ESCALATED
- `POST /actions/{id}/reject` — ESCALATED → DENIED + writes `escalation_reviews` row; 409 if not ESCALATED
- `escalation_reviews` table: `review_id`, `action_id` (UNIQUE FK), `reviewer_id`, `reviewer_decision`, `reviewer_note`, `reviewed_at`

**Worker:** Checks `escalation_reviews` by `action_id` before execution. If found, merges `{review_id, reviewer_id, reviewer_decision, reviewed_at}` into `execution_result` so the receipt is traceable back to the human approver.

**SDK:** `ActionEscalatedError(action_id)` — raised immediately when `execute()` polls and sees ESCALATED. Agents should not block waiting for a human; surface the escalation, log it, and move on.

---

## Console UI — `console/`

### Status: ✅ Complete (7 tabs + Escalations nav)

**Inspector tabs (entity-scoped):**

| Tab | Description |
|---|---|
| **State** | Current materialized entity state + provenance |
| **Timeline** | Full event log, expandable payload per event |
| **Diff** | State changes between revisions |
| **Deliveries** | Webhook delivery status, attempts, errors |
| **Actions** | All action contracts — status lifecycle, colored badges, clickable rows |
| **Receipt** | Selected action's receipt — decision banner, conditions pass/fail, entity state snapshot, execution result, SHA-256 hash with copy button |
| **Developers** | API keys, subscriptions |

**Flow:** Actions tab → click a row → auto-navigates to Receipt tab with dot indicator

**Sidebar navigation:**

| Nav Item | Description |
|---|---|
| Inspector | Entity-scoped Account Inspector |
| Escalations | Tenant-wide escalation queue with approve/reject UI |
| Events Feed | Coming soon |
| Developers | API keys + subscriptions |

**Escalation panel (`EscalationPanel.tsx`):**
- Left: queue list — `action_id`, `action_type`, `target_entity`, `proposed_by`, timestamp
- Right: detail + `reviewer_id` input + optional note + Approve / Reject buttons
- After decision: row disappears from queue immediately, status transitions server-side

---

## Python SDK — `sdk/`

### Status: ✅ Complete

**Package:** `statis-ai` (PyPI name), import as `statis`
**Build backend:** hatchling | **Runtime dep:** `httpx>=0.24.0`

```python
from statis import StatisClient, ActionDeniedError, ActionEscalatedError, ActionTimeoutError

with StatisClient(api_key="...", base_url="https://api.statis.dev") as client:
    try:
        receipt = client.execute(
            action_type="retention_offer",
            target={"entity_type": "account", "entity_id": "acct-1"},
            parameters={"discount_pct": 20},
            agent_id="csm-agent-v2",
            target_system="stripe",
        )
    except ActionDeniedError as e:
        print(f"Denied — {e.receipt.decision}")
    except ActionEscalatedError as e:
        print(f"Needs human review — action_id: {e.action_id}")
    except ActionTimeoutError as e:
        print(f"Timed out after {e.timeout}s")
```

**Public surface:**

| Symbol | Description |
|---|---|
| `StatisClient` | Sync client — `propose()`, `execute()`, `get_receipt()`, `get_action_status()`, context manager |
| `Receipt` | Typed dataclass — all receipt fields including `conditions_evaluated` |
| `ActionDeniedError` | Raised by `execute()` on DENIED; carries `.receipt` |
| `ActionEscalatedError` | Raised by `execute()` on ESCALATED; carries `.action_id` |
| `ActionTimeoutError` | Raised by `execute()` on poll timeout; carries `.action_id`, `.timeout` |
| `StatisError` | Raised on non-2xx API responses; carries `.status_code`, `.message` |

**Behavior:**
- `agent_id` param → `proposed_by` on the wire
- `action_id` auto-generated as `statis-{uuid}` if not provided
- `execute()` raises `ActionEscalatedError` immediately — agents should not block for human review
- `get_action_status(action_id)` → raw status string for agents that need to poll manually
- 11 unit tests via `respx` mocks — all passing

---

## Landing Page — `landing/`

### Status: ✅ Complete — merged to `main`

**Tech:** Next.js 15 / React 19 / Tailwind CSS / Framer Motion

**Page structure (in order):**

| Section | Component | Description |
|---|---|---|
| Navbar | `NavbarV2` | Logo + nav links incl. Primitives |
| Hero | `HeroV2` | Particle network BG, badge, H1 with gradient span, pill chain, CTAs |
| The Problem | `BentoFeaturesSection` | Two-card grid: Read Problem + Write Problem with incident logs |
| Bridge | `ProblemBridgeSection` | Kinetic zoom animation: "You wouldn't deploy code without CI/CD. You shouldn't deploy agents without Statis." |
| The Solution | `IntroducingStatisSection` | 5-step bento grid — State → Propose → Evaluate → Execute → Receipt |
| Core Primitives | `BeforeAfterSection` | 2×2 grid of P1–P4 with pastel cards and code detail blocks |
| Demo Scenario | `UseCasesSection` | Split layout: entity state + rule panels (light) + dark terminal |
| Architecture | `AIStackSection` | 3-row stack: Agents ↕ Statis (highlighted) ↕ Production |
| The Distinction | `MemoryVsRealitySection` | "Not X" cards + Memory vs Reality / Logs vs Receipts comparisons |
| FAQ + CTA | `FAQSection` | Animated accordion FAQ (light) + dark CTA block |
| Footer | `FooterV2` | Logo, tagline, GitHub link |

**Theme:** White/gray-50 backgrounds, `text-gradient` (indigo-600 → violet-600) on all H2 headers

---

## Demo Script — `examples/`

### Status: ✅ Complete

`examples/retention_demo.py` — full end-to-end demo
- Entity: `acct-42`, fresh `action_id` each run (`act-demo-HHMMSS`)
- Posts `account.churn_risk_updated { churn_risk: true }`
- Starts execution worker in background thread
- Polls `GET /actions/{id}` every 500ms until `COMPLETED`
- Step 6 proves idempotency: 409 on duplicate propose + 409 on re-evaluate
- Run: `STATIS_API_KEY=<key> python examples/retention_demo.py`

---

## Deployment

| Target | Config |
|---|---|
| Render.com | `render.yaml` |
| Heroku | `Procfile` |
| Environment | `DATABASE_URL` env var |

> ⚠️ Pending: run `alembic upgrade head` on deployed DB to apply migrations 0013–0015

---

## What's Next (not yet built)

- [ ] Run `alembic upgrade head` on deployed DB (migrations 0013–0015)
- [ ] TypeScript SDK
- [ ] Real adapter integrations (Salesforce, Zendesk, HubSpot)
- [ ] VPC / self-hosted deployment option
- [ ] Landing: Docs site

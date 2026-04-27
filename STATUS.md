# Statis — Build Status

> **Keep this file current.** Update it whenever a feature ships, a section changes, or a milestone closes.
>
> Last updated: 2026-04-24

---

## What Statis Is

**One decorator. Your agent asks permission before it touches production.**

`@statis.gate` wraps any Python function an agent calls. First run blocks for a human approval via a signed single-use URL; after the third identical approval, a YAML rule is auto-drafted so the action graduates into policy and stops paging humans. Every action — approved, denied, executed — gets a hash-chained SHA-256 receipt from action one.

The decorator is the developer surface. Underneath it sits the four-primitive engine that has shipped in `api/` since Q1:

1. **Action Contract** — agent proposes before it executes
2. **Policy Engine** — deterministic rules evaluate the proposal
3. **Execution Guarantee** — distributed lock enforces exactly-once
4. **Ledger** — tamper-evident receipt written at execution

The decorator wedge (locked 2026-04-24) is the marketing position; the primitives are the contract everything compiles down to.

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

### DB Schema — 19 migrations (18 applied, 0028 pending)

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
| 0016 | seed Salesforce policy rules (`salesforce_update_record_v1`, `salesforce_create_record_v1`) |
| 0017 | seed Zendesk policy rules (`zendesk_create_ticket_v1`, `zendesk_update_ticket_v1`) |
| 0018 | seed HubSpot policy rules (`hubspot_update_contact_v1`, `hubspot_create_deal_v1`) |
| 0019 | create users table |
| 0020 | add tenant_id to policy_rules |
| 0021 | add key_prefix to api_keys |
| 0022 | add description to policy_rules |
| 0023 | create kill_switch table, add mode to action_contracts |
| 0024 | add mode to receipts |
| 0025 | create webhooks table |
| 0026 | create threat_log table |
| 0027 | add SSO fields to users |
| 0028 | seed GitHub dogfood policy rules (7 rules for 4 action types) |

### Tests

- **149 unit tests** (`api/tests/unit/`) — all passing
- **16 integration tests** using `testcontainers[postgres]`
- Notable suites: `test_policy_evaluator.py` (14 tests), `test_receipt_hash.py` (8 tests), `test_airflow_adapter.py` (7 tests), `test_salesforce_adapter.py` (8 tests), `test_zendesk_adapter.py` (9 tests), `test_hubspot_adapter.py` (9 tests)

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
| `"salesforce"` | `SalesforceAdapter` | `salesforce_update_record`, `salesforce_create_record` |
| `"zendesk"` | `ZendeskAdapter` | `zendesk_create_ticket`, `zendesk_update_ticket` |
| `"hubspot"` | `HubSpotAdapter` | `hubspot_update_contact`, `hubspot_create_deal` |
| `"github_merge_pr"` | `GenericAdapter` | `github_merge_pr` (audit-only, Phase 1) |
| `"github_create_release"` | `GenericAdapter` | `github_create_release` (audit-only, Phase 1) |
| `"github_trigger_workflow"` | `GenericAdapter` | `github_trigger_workflow` (audit-only, Phase 1) |
| `"github_close_issue"` | `GenericAdapter` | `github_close_issue` (audit-only, Phase 1) |

---

## Adapters — `api/app/adapters/`

### MockStripeAdapter — `stripe_mock.py`
- Handles `retention_offer` + `apply_discount`
- Returns `{"charge_id": "ch_mock_{action_id[:8]}"}` in `execution_result`
- 50ms simulated latency

### AirflowAdapter — `airflow.py`
- Triggers DAG runs via Airflow Stable REST API v1 (`POST /api/v1/dags/{dag_id}/dagRuns`)
- `action_id` used as `dag_run_id` — idempotency key (Airflow 409 → success, not error)
- Config: `AIRFLOW_BASE_URL`, `AIRFLOW_USERNAME`, `AIRFLOW_PASSWORD`
- `parameters.dag_id` required; `parameters.conf` and `parameters.logical_date` optional

### SalesforceAdapter — `salesforce.py`
- `salesforce_update_record` — PATCH sObject via Salesforce REST API v57 (idempotent by nature)
- `salesforce_create_record` — POST sObject; injects `Statis_Action_Id__c` as idempotency key
- Config: `SALESFORCE_INSTANCE_URL`, `SALESFORCE_ACCESS_TOKEN`, `SALESFORCE_API_VERSION` (default `v57.0`)

### ZendeskAdapter — `zendesk.py`
- `zendesk_create_ticket` — POST ticket with `external_id = action_id` (idempotency key)
- `zendesk_update_ticket` — PUT ticket status/comment
- Config: `ZENDESK_SUBDOMAIN`, `ZENDESK_EMAIL`, `ZENDESK_API_TOKEN`

### HubSpotAdapter — `hubspot.py`
- `hubspot_update_contact` — PATCH contact properties via HubSpot CRM API v3
- `hubspot_create_deal` — POST deal with `hs_unique_creation_key = action_id` (idempotency key); 409 → success
- Config: `HUBSPOT_ACCESS_TOKEN`

---

## Policy Engine — `api/app/policy/evaluator.py`

### Status: ✅ Complete

Pure `PolicyEvaluator` — zero DB imports, fully unit-testable.

**Seeded rules:**

| Rule ID | Action Type | Conditions | Decision |
|---|---|---|---|
| `churn_retention_v1` | `retention_offer` | `churn_risk=true`, `min_ltv=1000`, `no_discount_days=30` | APPROVED |
| `airflow_dag_trigger_v1` | `airflow_dag_trigger` | `operator_approved=true` | APPROVED |
| `salesforce_update_record_v1` | `salesforce_update_record` | `operator_approved=true` | APPROVED |
| `salesforce_create_record_v1` | `salesforce_create_record` | `operator_approved=true` | APPROVED |
| `zendesk_create_ticket_v1` | `zendesk_create_ticket` | `operator_approved=true` | APPROVED |
| `zendesk_update_ticket_v1` | `zendesk_update_ticket` | `operator_approved=true` | APPROVED |
| `hubspot_update_contact_v1` | `hubspot_update_contact` | `operator_approved=true` | APPROVED |
| `hubspot_create_deal_v1` | `hubspot_create_deal` | `operator_approved=true` | APPROVED |
| `github_merge_pr_v1` | `github_merge_pr` | `ci_status=passed`, `approvals_gte=1` | APPROVED |
| `github_merge_pr_no_ci_v1` | `github_merge_pr` | (default fallback) | ESCALATED |
| `github_create_release_v1` | `github_create_release` | `operator_approved=true` | ESCALATED |
| `github_trigger_workflow_staging_v1` | `github_trigger_workflow` | `environment=staging` | APPROVED |
| `github_trigger_workflow_prod_v1` | `github_trigger_workflow` | `environment=production` | ESCALATED |
| `github_close_issue_v1` | `github_close_issue` | `opened_by_agent=true` | APPROVED |
| `github_close_issue_human_v1` | `github_close_issue` | (default fallback) | ESCALATED |

**Condition keys:**

| Key | Source | Description |
|---|---|---|
| `churn_risk` | `entity_state` | Bool/string truthy check |
| `min_ltv` | `entity_state` | Float threshold — `ltv >= value` |
| `no_discount_days` | `entity_state` + event history | No discount within N days |
| `operator_approved` | `action.context` | Caller attestation — not entity state |
| `ci_status` | `entity_state` | String match (e.g. `passed`) |
| `approvals_gte` | `entity_state` | Int threshold — `approvals >= value` |
| `environment` | `entity_state` / `action.parameters` | String match (e.g. `staging`, `production`) |
| `opened_by_agent` | `entity_state` | Bool check — issue opened by an agent |

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
| Developers | API keys + subscriptions |

**Escalation panel (`EscalationPanel.tsx`):**
- Left: queue list — `action_id`, `action_type`, `target_entity`, `proposed_by`, timestamp
- Right: detail + `reviewer_id` input + optional note + Approve / Reject buttons
- After decision: row disappears from queue immediately, status transitions server-side

---

## TypeScript SDK — `sdk-ts/`

### Status: ✅ Complete — published to npm as `statis-ai@0.1.0`

**Package:** `statis-ai` (npm) · zero runtime dependencies · native `fetch` (Node 18+)
**Build:** TypeScript 5 / CommonJS

**Public surface:**

| Symbol | Description |
|---|---|
| `StatisClient` | Async client — `propose()`, `execute()`, `getReceipt()`, `getActionStatus()` |
| `Receipt` | Typed interface — all receipt fields including `conditions_evaluated` |
| `ActionDeniedError` | Raised by `execute()` on DENIED; carries `.receipt` |
| `ActionEscalatedError` | Raised by `execute()` on ESCALATED; carries `.action_id` |
| `ActionTimeoutError` | Raised by `execute()` on poll timeout; carries `.action_id`, `.timeout` |
| `StatisError` | Raised on non-2xx API responses; carries `.status_code`, `.message` |

- 11 unit tests using Node built-in test runner — all passing
- Mirrors Python SDK surface exactly

---

## Python SDK — `sdk/`

### Status: ✅ Complete — published to PyPI as `statis-ai@0.1.0`

**Package:** `statis-ai` (PyPI), import as `statis`
**Build backend:** hatchling | **Runtime dep:** `httpx>=0.24.0`

**Public surface:**

| Symbol | Description |
|---|---|
| `StatisClient` | Sync client — `propose()`, `execute()`, `get_receipt()`, `get_action_status()`, context manager |
| `Receipt` | Typed dataclass — all receipt fields including `conditions_evaluated` |
| `ActionDeniedError` | Raised by `execute()` on DENIED; carries `.receipt` |
| `ActionEscalatedError` | Raised by `execute()` on ESCALATED; carries `.action_id` |
| `ActionTimeoutError` | Raised by `execute()` on poll timeout; carries `.action_id`, `.timeout` |
| `StatisError` | Raised on non-2xx API responses; carries `.status_code`, `.message` |

- `agent_id` param → `proposed_by` on the wire
- `action_id` auto-generated as `statis-{uuid}` if not provided
- `execute()` raises `ActionEscalatedError` immediately — agents should not block for human review
- 11 unit tests via `respx` mocks — all passing

---

## Docs — `docs/`

### Status: ✅ Complete — Mintlify, ready to deploy

**Structure:**
- **Guides:** Introduction, Quickstart, 4 primitive pages, Escalation, Adapters, Console
- **SDKs:** Python + TypeScript full reference
- **API Reference:** Introduction + 8 endpoint pages with curl examples and request/response schemas

Deploy: connect `statis-ai/statis-core` to mintlify.com → set docs dir to `docs/` → point `docs.statis.dev` CNAME.

---

## Landing Page — `landing/`

### Status: ✅ V6 (decorator wedge) shipped 2026-04-24 — merged to `main`

**Tech:** Next.js 16 (Turbopack) / React 19 / TypeScript / scoped CSS

**Component:** `landing/src/components/landing/v6/LandingV6.tsx` (+ `landing-v6.css`).
V5 lives at `v5/LandingV5.tsx`; one-line swap in `src/app/page.tsx` reverts.

**Section order (top → bottom):**

| Section | Description |
|---|---|
| Topbar | Wordmark · v0.2 · beta tag · Demo / Blog / GitHub / Docs / Sign in |
| Hero | Two-column: copy + dual CTAs · code block (`@statis.gate("stripe.refund")`) + 4-frame animated terminal |
| How It Works | 4-step grid — Decorate → Approve once → Receipts from action one → Graduate to policy |
| Graduation | Approval card + auto-drafted YAML rule (3rd identical approval mechanic) |
| Comparison | 5-row table — `@statis.gate` vs Slack approval bots vs LangGraph interrupts |
| Dogfood | Stat trio: 104 gates / 0 incidents / 100% receipts |
| Receipt | Single hash-chained receipt card with SHA-256 chain anchor |
| CTA | `pip install statis-ai` install command + beta email form (POST `/api/subscribe`, source `v6-cta`) |
| Footer | 3-col — Product / Developers / Company · Privacy + Terms · trust seal |

**Positioning lock:** the page leads with the decorator wedge per the 2026-04-24 office-hours design doc — no four-pillars / three-tiers framing. Primitives engine is documented in this file and at `docs.statis.dev`, not on the marketing surface.

**Build config note:** `next.config.ts` sets `turbopack.root` to the parent of `landing/` so Turbopack can follow the `statis-kit` symlink (`file:../kit-ts`) used by `/debug`.

---

## Demo Scripts — `examples/`

### Status: ✅ Complete

`examples/retention_demo.py` — full end-to-end demo (all four primitives)
- Entity: `acct-42`, fresh `action_id` each run (`act-demo-HHMMSS`)
- Posts `account.churn_risk_updated { churn_risk: true }`
- Starts execution worker in background thread
- Polls `GET /actions/{id}` every 500ms until `COMPLETED`
- Step 6 proves idempotency: 409 on duplicate propose + 409 on re-evaluate
- Run: `STATIS_API_KEY=<key> python examples/retention_demo.py`

`examples/github_dogfood.py` — GitHub dogfood demo (Phase 1, audit-only)
- Proposes 4 GitHub action types via Python SDK: merge PR, create release, trigger workflow (staging + production)
- Seeds entity state via events, then evaluates policy rules
- Shows APPROVED vs ESCALATED decisions based on conditions (ci_status, approvals, environment)
- Run: `STATIS_API_KEY=<key> STATIS_BASE_URL=<url> python examples/github_dogfood.py`

---

## Deployment

| Target | Config |
|---|---|
| Render.com | `render.yaml` |
| Heroku | `Procfile` |
| DB | Neon PostgreSQL (18 migrations applied) |
| Environment | `DATABASE_URL` env var |

---

## What's Next (not yet built)

- [ ] Deploy docs site — connect `docs/` to Mintlify, point `docs.statis.dev`
- [ ] VPC / self-hosted deployment option
- [ ] More adapter integrations (Salesforce Connected App OAuth, Hubspot OAuth)
- [ ] TypeScript SDK — async/streaming variant

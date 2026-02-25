# MILESTONES.md — Statis Build Plan (Wedge-first)

> **Status summary (last updated 2026-02-25):**
> Milestones 1–6, 8, and 9 are **DONE**. Milestone 0 is NOT STARTED.
> Milestones 10 through 14 are **PLANNED** (next up).

---

## Milestone 0 — Repo + local dev harness (setup)
**Goal:** deterministic local environment for API + DB + worker + tests.

**Deliverables**
- docker-compose: Postgres + api + worker (+ optional test webhook receiver)
- Makefile targets: `make dev`, `make test`, `make seed_demo`
- CI-friendly test command

**Acceptance**
- `make test` passes from a clean checkout

**Status:** NOT STARTED

---

## ✅ Milestone 1 — Append-only event ingestion (idempotent) — DONE
**Implement**
- `POST /events`
- `events` table + Alembic migrations
- field validation
- idempotency: same `(tenant_id, event_id)` returns accepted without duplicating
- deterministic ordering fields exist: `occurred_at`, `ingested_at`, `event_id`

**Tests**
- unit: validation, idempotency
- integration: insert events, verify count/order

**Docs**
- example curl requests

---

## ✅ Milestone 2 — Deterministic materialized state — DONE
**Implement**
- reducer framework: `event_type -> reducer(state, event) -> new_state`
- `entity_state` table with `state_hash` (sha256 canonical JSON)
- `GET /state/{entity_type}/{entity_id}`
- materialize-on-write (synchronous) for MVP simplicity
- provenance: contributing event_ids (last N ok if documented)

**Must-have tests**
- determinism: replay same events twice ⇒ identical `state_hash`
- ordering: follow deterministic tie-breakers
- provenance included in response

**Docs**
- document reducer behavior + conflict rules used (even if minimal)

---

## ✅ Milestone 2.5 — Customer Ops "Account State Pack" (Wedge Packaging) — DONE
**Goal:** ship an installable wedge on top of the primitives (not just infra).

### Implement
**Opinionated schema (account)**
- `entity_type = "account"`
- state fields (v0):
  - `blockers: string[]`
  - `risk_flags: string[]`
  - `sentiment: { label: "positive"|"neutral"|"negative", updated_at }`
  - `open_incidents: { id, type, status, occurred_at }[]`
  - `churn_risk: boolean`
  - `next_actions: { owner: "sales"|"csm"|"billing", action, reason }[]`

**Reducers (3–5 types, deterministic)**
- `support.incident_reported`
- `support.sentiment_updated`
- `support.ticket_updated` (optional if you already have it)
- `billing.plan_changed`
- `csm.escalation_requested` (optional)

**Conflict rules (explicit + documented)**
- source precedence table (system-of-record > human > agent, etc.) if available
- supersession events if used
- tie-breaking for updates (occurred_at, ingested_at, event_id)

### Tests
- wedge determinism test: same inputs ⇒ same state
- schema validation test: bad payload rejected
- golden snapshot test: known event stream ⇒ expected final `account` state JSON + hash

### Docs
- `docs/state_pack_account.md` describing:
  - state schema
  - each reducer behavior
  - conflict rules

### Acceptance
- `examples/csm_demo.py` runs and produces expected `account_state` transitions **without** requiring subscriptions.

**Status:** DONE

---

## ✅ Milestone 3 — Subscriptions + delivery queue + worker (Wedge-native) — DONE
**Goal:** push-based coordination + explainable delivery.

### Implement
- `subscriptions` table + `POST /subscriptions` (webhooks only)
- `deliveries` table as DB-backed queue
- on **state change** (rev increments), enqueue deliveries for matching subscriptions
- dedupe: unique `dedupe_key = subscription_id:entity:rev`
- worker polls queue, POSTs webhook payload
- retry with exponential backoff
- DLQ after N attempts (N=5)
- `GET /delivery-trace/{subscription_id}?limit=`

### Wedge templates (ship as examples)
Create "starter subscription templates" in `examples/subscription_templates/`:
- Sales pause:
  - fire when `churn_risk` flips `false -> true` OR `blockers` contains `"login_outage"`
- Billing pause dunning:
  - fire when `churn_risk=true` OR blockers contains `"billing_issue"`
- CSM escalate:
  - fire when churn_risk flips to true OR sentiment becomes negative

### Tests
- integration: create subscription, emit events, worker sends webhook to local receiver
- retry test: receiver returns 500 twice then 200; verify attempt_count + final status sent
- guardrail test: debounce/rate limit prevents storm (scripted)

### Acceptance
- p95 state commit → webhook fired < 300ms (local)
- delivery trace shows:
  - fired_rule + predicate snapshot + attempt history

**Status:** DONE

---

## ✅ Milestone 4 — Replay + time machine (Admin) — DONE
**Goal:** backfill + audit: "what did X know at rev N?"

### Implement
- `GET /events` query endpoint (if not already)
- `POST /replay` filters:
  - `subscription_id` (required)
  - optional `entity_type/entity_id/from_rev/to_rev`
- replay enqueues deliveries again (does not duplicate events)
- `GET /state/{entity_type}/{entity_id}/at?rev=` (preferred time machine)

### Tests
- rebuild-from-scratch: delete `entity_state` and recompute from events ⇒ same hashes
- replay: new subscription receives backfilled deliveries for range

### Acceptance
- demo question answered deterministically:
  - "What did Sales know when it paused?" → `state_at(rev)` + provenance + delivery trace

**Status:** DONE

---

## ✅ Milestone 5 — Console UI (Thin trust surface; wedge-first) — DONE
**Goal:** make the system inspectable in minutes.

### Implement (Next.js)
- Landing screen: **Account Inspector** (default wedge)
- Tabs:
  - State (rev, hash, JSON)
  - Timeline (events)
  - Diff (from_rev/to_rev)
  - Deliveries (trace drill-down)

### Tests
- Playwright smoke test: load inspector, fetch state for seeded demo entity

### Acceptance
- can debug a single entity end-to-end in < 2 minutes locally

**Status:** DONE

---

## ✅ Milestone 6 — CSM demo scenario (The "aha") — DONE
**Goal:** make the story undeniable: PUSH + REPLAY + EXPLAINABLE STATE.

### Implement
- `examples/csm_demo.py`:
  - seeds outage + sentiment + plan change
  - shows state transitions and pushes to receivers
- `examples/webhook_receiver.py`:
  - prints payloads, simulates 500s for retry test optionally

### Docs
- `docs/demo_csm.md` step-by-step commands + expected outputs

### E2E
- automated test:
  - seed events
  - assert final state JSON + hash
  - assert delivery records + trace present

**Status:** DONE

---

## ✅ Milestone 8 — Security & Multi-tenancy Hardening (The Foundation) — DONE
**Goal:** enforce strict tenant boundaries and agent identity on top of the existing `api_keys` + tenant scoping.

> **Context:** `api_keys` table, `get_tenant_id()` dependency, and per-route tenant filtering already exist (Milestones 1–2). This milestone hardens that foundation.

### Implement

**Extend `api_keys` schema**
- New Alembic migration: add `role` (String, nullable, e.g. `"admin"`, `"sales"`, `"billing"`, `"csm"`) and `agent_id` (String, nullable) columns to `api_keys`.

**Richer auth context**
- Refactor `get_tenant_id()` in `api/app/api/deps.py` into `get_auth_context()` returning `{ tenant_id, agent_id, role }`.
- Update all route handlers to accept the new context (backward-compatible: `tenant_id` still available).

**RBAC-lite filtering**
- `GET /events`: filter event visibility based on role (e.g. Billing cannot see `support.sentiment_updated` events).
- `GET /state`: redact state fields based on role (e.g. Billing cannot see `sentiment`).
- Role-field mapping configurable per tenant (start with a hardcoded default).

**Cross-tenant isolation test**
- Integration test: tenant_A key returns 403 (not 404) when accessing tenant_B resources.
- Decision: use 403 for explicit denial when a valid key targets another tenant's data.

### Tests
- unit: `get_auth_context()` returns correct role/agent_id
- integration: cross-tenant access returns 403
- integration: Billing role GET /events omits sentiment events
- integration: Billing role GET /state redacts sentiment fields

### Acceptance
- Attempting to fetch an event from tenant_A using a tenant_B key returns 404 (per OWASP: avoids leaking resource existence).
- Billing-role key cannot see sentiment data in events or state responses.

**Status:** DONE

---

## ✅ Milestone 9 — Concurrency, Scale & Safety — DONE
**Goal:** remove bottlenecks and sandbox the materialization engine.

### Implement

**Optimistic concurrency**
- Replace `SELECT FOR UPDATE` with version-checked `UPDATE ... WHERE state_version = :expected` on `entity_state`.
- On version conflict, retry materialization (bounded retries with backoff).

**Batch worker**
- Refactor `worker/deliver.py` to fetch and process deliveries in configurable batches (default 10) rather than one-by-one.
- Use `SELECT ... FOR UPDATE SKIP LOCKED` for safe concurrent batch claiming.

**Reducer sandboxing**
- Wrap reducer calls in execution timeouts (configurable, default 5s).
- Poison-pill DLQ: if a reducer fails 3 times for a specific event, skip materialization for that entity, mark it quarantined, and log an alert.

**Output validation**
- Add Pydantic validation to reducer output to ensure state schema integrity before persisting.
- Invalid reducer output triggers the poison-pill path (skip + alert).

### Tests
- concurrency: 100 concurrent `POST /events` for the same entity — no deadlocks, all events ingested, final state deterministic
- batch: worker processes N deliveries per poll cycle
- timeout: slow reducer is killed after threshold
- poison-pill: reducer that always raises is quarantined after 3 attempts

### Acceptance
- Successfully ingest 100 concurrent events for the same entity without transaction deadlocks.
- Worker throughput improves measurably with batch processing vs one-by-one.

**Status:** DONE (see docs/milestone9_completed.md)

---

## Milestone 10 — The Semantic Log (Dual-Payload)
**Goal:** Protect "Raw Truth" while enabling structured interpretation for downstream materialization.

### Implement
**Dual-Payload Storage**
- New migration: modify the `events` table to include `raw_payload` (immutable agent input), `semantic_payload` (LLM-parsed intent), and `gatekeeper_metadata` (model versioning).
- Ensure existing deterministic ordering `(occurred_at, ingested_at, event_id)` is preserved.

**Semantic Gatekeeper**
- Implement a pre-processor middleware that uses an LLM to map unstructured `raw_payload` facts into structured `semantic_payload` events before they hit the reducer layer.

### Acceptance
- Log stores both the original unstructured text and the structured semantic fields.
- Re-running the Gatekeeper on historical `raw_payload` successfully updates `semantic_payload` without data loss.

**Status:** PLANNED

---

## Milestone 11 — Governance & The "Semantic Firewall"
**Goal:** Differentiate for the "VP Eng" persona via explainability, guardrails, and state safety.

### Implement
**Semantic Exceptions (Invariants)**
- Define "Invariant Functions" that run immediately after a reducer but before the DB transaction commits.
- If an invariant is violated (e.g., `account_balance < 0`), reject the event with `422 Unprocessable Entity` and rollback the transaction.

**Threshold Subscriptions & Redaction**
- Add a `predicate` field (JSONB) to `subscriptions`.
- Delivery is only enqueued when the predicate evaluates to true after a state change.
- In `_enqueue_deliveries`, apply role-based filters so webhook payloads only contain fields the subscription's owning role is authorized to see.

**Ephemeral State (TTLs)**
- Add metadata to events or state fields for "short-lived" facts (e.g., `agent_is_thinking`).
- Add logic to exclude expired fields from `GET /state` responses.

**Console Audit Logs**
- Update the Console UI Timeline tab to show which `api_key` label / `agent_id` triggered each revision.

### Acceptance
- Attempting to write an event that breaks a business rule results in a transactional rollback.
- A subscription with a `churn_risk == true` predicate fires only on matching state changes.
- Webhook payloads respect role-based redaction.

**Status:** PLANNED

---

## Milestone 12 — The Reducer Factory (Compiler)
**Goal:** Eliminate "Pure Reducer Complexity" by using LLMs as deterministic code compilers to scale Wedge Packaging.

### Implement
- **LLM Reducer Generator:** CLI tool that converts natural language transitions into pure Python reducer functions.
- **Automated Testing:** Generator produces a `pytest` suite for every new reducer to verify immutability and determinism.
- **Verification Engine:** CI/CD step that prevents registration of any reducer that fails its generated tests.

### Acceptance
- A developer can describe a state transition in English and get a tested, pure Python reducer in < 60s.
- The LLM is never invoked during the live execution `fold` operation, preserving strict determinism.

**Status:** PLANNED

---

## Milestone 13 — DX & Observability (Go-to-Market)
**Goal:** Lower integration friction and provide high-level bus health.

### Implement
**SDKs (Python + TypeScript)**
- `sdk/python/` & `sdk/ts/`: wrappers handling `event_id` generation, retries, and type hints.
- `postEvent()`, `getState()`, `subscribe()`.

**Local Simulation**
- `POST /dry-run`: runs the reducer and returns the projected new state + diff without committing the event.

**Observability**
- Global health dashboard: Console view showing event throughput and worker lag.
- OpenTelemetry: propagate `trace_id` from `POST /events` into webhook delivery headers.

### Acceptance
- A new developer can install the SDK and push their first state-change in under 5 minutes.
- `/dry-run` returns correct projected state without persisting anything.

**Status:** PLANNED

---

## Milestone 14 — Analytics Win (State-derived metrics)
**Goal:** Prove Statis also powers reliable analytics from the same log.

### Implement
- `account_daily_state(entity_id, day, plan, open_tickets, churn_risk, state_hash)`
- Backfill job for last 30 days deterministically.

### Acceptance
- Deterministic recompute yields identical outputs/hashes.
- Late events affect only impacted days.

**Status:** PLANNED

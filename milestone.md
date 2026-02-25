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

## ✅ Milestones 1 through 6 — DONE
*Foundation, Materialization, Account Wedge, Subscriptions, Replay, and Console UI.*

---

## ✅ Milestone 8 & 9 — Security, Multi-tenancy, & Concurrency — DONE
*RBAC-lite filtering, Optimistic Concurrency Control (OCC), Batch workers, and Sandboxing.*

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

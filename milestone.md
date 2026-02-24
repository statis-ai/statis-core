# MILESTONES.md — Statis Build Plan (Wedge-first)

> Status note: Milestones 1 and 2 are marked DONE per your current build.
> Keep updating this file as the “what’s next” contract for Cursor.

---

## Milestone 0 — Repo + local dev harness (setup)
**Goal:** deterministic local environment for API + DB + worker + tests.

**Deliverables**
- docker-compose: Postgres + api + worker (+ optional test webhook receiver)
- Makefile targets: `make dev`, `make test`, `make seed_demo`
- CI-friendly test command

**Acceptance**
- `make test` passes from a clean checkout

**Status:** (optional / depends on repo maturity)

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

## Milestone 2.5 — Customer Ops “Account State Pack” (Wedge Packaging)
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

**Status:** PLANNED

---

## Milestone 3 — Subscriptions + delivery queue + worker (Wedge-native)
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
Create “starter subscription templates” in `examples/subscription_templates/`:
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

**Status:** PLANNED

---

## Milestone 4 — Replay + time machine (Admin)
**Goal:** backfill + audit: “what did X know at rev N?”

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
  - “What did Sales know when it paused?” → `state_at(rev)` + provenance + delivery trace

**Status:** PLANNED

---

## Milestone 5 — Console UI (Thin trust surface; wedge-first)
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

**Status:** PLANNED

---

## Milestone 6 — CSM demo scenario (The “aha”)
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

**Status:** PLANNED

---

## Milestone 7 — Analytics win (State-derived metrics)
**Goal:** prove Statis also powers reliable analytics from the same log.

### Implement
- `account_daily_state(entity_id, day, plan, open_tickets, churn_risk, state_hash)`
- backfill job for last 30 days deterministically

### Tests
- deterministic recompute ⇒ identical outputs/hashes
- late event affects only impacted days (rule documented)

### Docs
- `docs/analytics.md` explaining derivation + backfill semantics

**Status:** PLANNED
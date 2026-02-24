# STATIS_CONTEXT.md — Statis (Semantic Event Bus for AI State)
**SOURCE OF TRUTH for Cursor + repo behavior**

## 0) Purpose
Statis is a **Semantic Event Bus** for AI workflows and automations:
1) ingest semantic events (claims/facts/signals) from agents/services/humans,
2) commit them to an **append-only log**,
3) deterministically **materialize entity state**,
4) **push** state-change notifications to subscribers (agents/services/workflows),
5) support **replay + time travel** for audit/debug (“what did X know at rev N?”).

This is **NOT** a memory DB, vector store, RAG system, or agent framework.
This is **PUSH + REPLAY + GOVERNED MATERIALIZED STATE**.

---

## 1) Initial wedge + demo (Wedge-first, multi-agent expands later)
### Wedge (ship now)
**Customer Ops “Shared Truth”** for workflows that already exist today:
- Support ↔ CSM ↔ Sales ↔ Billing coordination
- Humans + automations + copilots (agents optional on day 1)

Statis is the missing reliability layer: **publish facts once → golden state → push changes → replayable audit**.

### Demo (primary)
**CSM coordination outage cascade prevention**
- Support publishes outage + customer sentiment spike
- State updates (<2s): `churn_risk=true`, `blockers+=login_outage`
- Push (<300ms):
  - Sales pauses outreach
  - Billing suspends dunning retries
  - CSM escalates to human + drafts retention message
- Then time machine:
  - “What did Sales know when it paused?”
  - show `state_at(rev)` + provenance + delivery trace (rule fired, predicate snapshot, attempts)

### Secondary win
**Analytics derived from the same semantic log**
- deterministic backfills, state-derived daily tables, explainable metric lineage

---

## 2) Non-negotiable primitives
1) Append-only semantic event log (**truth**)
2) Deterministic materialized state derived from the log (**golden record**)
3) Subscriptions + rules with guardrails (**push delivery**)
4) Replay + time machine (**state_at + provenance + delivery trace**)

---

## 3) Non-goals (v0 / first 6 months)
- No embeddings / vector search / RAG
- No “automatic interpretation” beyond explicit deterministic reducers
- No exactly-once delivery (v0 is **at-least-once** + idempotency keys)
- No heavy RBAC / enterprise governance in v0 (auth minimal, RBAC-lite later)
- No heavy dashboards beyond a broker console trust surface

---

## 4) Tech stack defaults (MVP)
- Backend: **Python + FastAPI**
- DB: **Postgres**
- Migrations: Alembic
- Worker: Python worker process (polls DB-backed delivery queue)
- Console UI: minimal Next.js/React (Entity Inspector + Diff + Provenance + Delivery Trace)
- SDKs: TypeScript + Python thin wrappers (after API stabilizes)

---

## 5) Identity / auth (MVP-lite)
- API key maps to: `{tenant_id, agent_id, role}`
- Server derives `tenant_id/agent_id/role` from key (do not trust client-supplied values)
- Role-based redaction can be **stubbed** in v0 (full RBAC-lite later)

---

## 6) Data model (minimum)
### 6.1 events (append-only log)
**Required**
- `event_id` (idempotency key; unique per tenant)
- `entity_type` (e.g., `"account"`)
- `entity_id` (string)
- `event_type` (e.g., `"support.incident_reported"`)
- `payload` (jsonb)
- `occurred_at` (timestamp)
- `producer` (string, e.g., `"zendesk"`, `"support_agent"`)
- `schema_version` (string/int)

**Server-assigned / derived**
- `tenant_id`
- `agent_id`, `role`
- `ingested_at`
- `trace_id` (optional passthrough)
- `rev` (monotonic per `{tenant_id, entity_type, entity_id}`)

### 6.2 entity_state (materialized)
- `tenant_id`
- `entity_type`, `entity_id`
- `rev` (current revision)
- `schema_version`
- `state` (jsonb)
- `state_hash` (sha256 of canonical JSON)
- `last_event_id`
- `last_occurred_at`
- `materialized_at`

### 6.3 provenance (explainability)
Either:
- `state_provenance(tenant_id, entity_type, entity_id, rev, event_ids[])` (json/array)
or:
- `state_provenance_events(tenant_id, entity_type, entity_id, rev, event_id)` (normalized)

### 6.4 subscriptions (push)
- `subscription_id`
- `tenant_id`
- `filter` (jsonb): entity_type + optional event_types + optional state predicates
- `destination` (webhook URL for v0)
- `status` (active/paused)
- `guardrails` (jsonb): debounce, rate limits, DLQ settings
- `created_at`

### 6.5 deliveries (queue + trace)
Queue record (idempotent per state change):
- `delivery_id`
- `tenant_id`
- `subscription_id`
- `entity_type`, `entity_id`
- `rev` (the state revision being delivered)
- `dedupe_key` (e.g., `${subscription_id}:${entity_type}:${entity_id}:${rev}` unique)
- `status` (pending/sent/failed/dead)
- `attempt_count`
- `next_attempt_at`
- `last_error`
- `sent_at`
- `response_code`

Trace record (why + how):
- `delivery_trace(delivery_id, fired_rule, predicate_snapshot, attempts[])`

---

## 7) Determinism + ordering rules (MUST)
- **Rev assignment**: `rev` is **server-assigned, monotonic per entity**.
- **Deterministic replay**: replay same events in stable order ⇒ identical `state_hash` per `rev`.
- **Stable ordering key for rebuild** (if needed): `(occurred_at ASC, ingested_at ASC, event_id ASC)` as tie-breakers.
- **Reducers must be pure**:
  - no randomness
  - no `now()` inside reducers
  - no external calls during materialization
- **Canonical JSON** before hashing:
  - stable key ordering
  - consistent numeric/string representation
  - document array ordering expectations (arrays are ordered; reducers must be deterministic)

---

## 8) Materialization rules (critical)
- State is derived from the log; never mutate state without a log event
- Strict validation: invalid payloads rejected; invalid state transitions rejected (or quarantined if explicitly designed)
- Conflict resolution MUST be explicit:
  - timestamps
  - source-of-truth precedence
  - supersession events
- Determinism goal: `replay(log) -> identical state_hash per rev`

---

## 9) API surface (v0)
### Health
- `GET /health -> { ok: true }`

### Ingest (append-only + idempotent)
- `POST /events`
  - body: `{ event_id, entity_type, entity_id, event_type, payload, occurred_at, producer, schema_version, trace_id? }`
  - returns: `{ accepted: true, event_id, rev }`

### Read events (audit/debug)
- `GET /events?entity_type=&entity_id=&since=&until=&limit=`
  - returns: events in deterministic order

### Materialized state
- `GET /state/{entity_type}/{entity_id}`
  - returns: `{ entity_type, entity_id, rev, state, state_hash, last_event_id, provenance }`

### Diff + time machine
- `GET /state/{entity_type}/{entity_id}/diff?from_rev=&to_rev=`
- `GET /state/{entity_type}/{entity_id}/at?rev=`  (preferred)
  - optional alt: `at?ts=` if implemented later

### Subscriptions + delivery
- `POST /subscriptions` (webhook destinations only)
- `GET /subscriptions`
- `GET /subscriptions/{id}`
- `POST /subscriptions/{id}/pause`
- `POST /subscriptions/{id}/resume`

### Replay
- `POST /replay`
  - body: `{ subscription_id, entity_type?, entity_id?, from_rev?, to_rev? }`
  - behavior: enqueue deliveries again (do not duplicate events)

### Delivery trace
- `GET /delivery-trace/{subscription_id}?limit=`

---

## 10) Testing requirements (MUST per milestone)
- Unit tests: validation + reducers
- Integration tests: docker-compose (API + Postgres + worker)
- Determinism test: replay same event set twice ⇒ identical `state_hash`
- E2E demo test: seed CSM scenario ⇒ state changes ⇒ delivery recorded

---

## 11) Repo structure (monorepo)
/
  api/                  # FastAPI service
  worker/               # delivery worker
  console/              # minimal UI
  sdk/python/           # optional later
  sdk/ts/               # optional later
  examples/             # csm demo scripts + local webhook receiver
  docs/                 # architecture + demo guide + blog/paper
  docker-compose.yml
  Makefile
  STATIS_CONTEXT.md      # THIS FILE (source of truth)
  MILESTONES.md         # build plan + acceptance tests

---

## 12) Cursor guardrails (DO NOT HALLUCINATE)
- Only implement what is specified here.
- If something is missing, add TODOs and do NOT invent behavior.
- Prefer small, testable increments with acceptance checks.
- Keep API backward-compatible within v0 unless explicitly versioned.
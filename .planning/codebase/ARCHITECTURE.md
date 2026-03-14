# Architecture

## Pattern
Distributed event-driven system (commit + approve + execute once + receipt) with eventual consistency and idempotent execution guarantees.

Core pattern:
1. **Event ingestion** → append-only log
2. **State materialization** → pure reducers + optimistic concurrency
3. **Policy evaluation** → rule-based approval decisions
4. **Execution guarantee** → distributed locking + exactly-once semantics
5. **Async webhooks** → push delivery with exponential backoff

## Layers

### 1. API Layer (FastAPI)
**File:** `/api/app/main.py`
- FastAPI application with 8 routers: actions, events, receipts, state, subscriptions, deliveries, replay, admin
- CORS middleware (configurable frontend origins)
- Authentication via X-API-Key header (tenant-scoped)

**Route modules** (`/api/app/api/routes/`):
- `actions.py` — POST/GET action contracts; POST evaluate (policy decision)
- `events.py` — POST events (append-only ingestion)
- `receipts.py` — GET receipts by action_id (audit trail)
- `state.py` — GET entity state (current + time-travel queries at specific revisions)
- `subscriptions.py` — manage webhook subscriptions
- `deliveries.py` — list delivery attempts and status
- `replay.py` — force-replay event sequences
- `admin.py` — quarantine management, API key generation

### 2. Database Layer (SQLAlchemy ORM)
**Core models** (`/api/app/models/`):
- `Event` — append-only log (ordering: tenant_id, occurred_at, ingested_at, event_id)
- `EntityState` — materialized state (versioned, with state_hash for integrity)
- `ActionContract` — action proposals (PROPOSED → APPROVED/DENIED → EXECUTED/FAILED)
- `Receipt` — audit receipt (SHA-256 canonical hash of decision)
- `ExecutionLock` — distributed mutex (PK on action_id, INSERT ON CONFLICT DO NOTHING)
- `Subscription` — webhook subscriptions (destination + filters)
- `Delivery` — webhook delivery attempts (with exponential backoff)
- `PolicyRule` — stored policy rules (with conditions + priority)
- `QuarantineEntry` — failed entity state (3 failures → quarantine + alert)
- `ApiKey` — tenant authentication (hashed keys)
- `User` — console users (optional)
- `EscalationReview` — manual escalation decisions

**Session management** (`/api/app/db/`):
- Global session factory + engine (singleton pattern)
- `get_db()` dependency for FastAPI routes

### 3. Business Logic Layer

#### Policy Evaluation (`/api/app/policy/`)
**File:** `evaluator.py`
- Pure `PolicyEvaluator` class (no DB imports, fully testable)
- Input: action, entity_state, event_history, rules
- Output: `PolicyDecision` (decision + rule_id + reason)
- Matching: highest-priority rule wins
- Conditions: churn_risk (bool), min_ltv (int), no_discount_days (int), event lookback (7 days)

#### State Materialization (`/api/app/repositories/events.py`)
**Core flow:**
1. Event ingestion: upsert Event table
2. Find reducer for event_type (or skip if no reducer)
3. Run reducer safely in sandbox (timeout + error bounds)
4. Optimistic concurrency: version-checked UPDATE (not SELECT FOR UPDATE)
5. On reducer failure: increment failure_count in QuarantineEntry
6. On 3rd failure: quarantine entity (poison-pill)
7. Enqueue webhook deliveries to subscribers

#### Reducer Registry (`/api/app/reducers/`)
**File:** `registry.py`
- Maps event_type → pure reducer function
- Supports aliases (e.g., `ticket.updated` → `support.ticket_updated`)
- Registered reducers in `account.py`: 9 reducers for account domain

**File:** `account.py`
- Pure functions: `reduce_ticket_updated()`, `reduce_plan_changed()`, `reduce_ltv_updated()`, etc.
- Input: current state dict + event payload
- Output: new state dict (or unchanged)
- All mutations are immutable (return new dict)

**Isolation:** `sandbox.py`
- Runs reducers in restricted context (timeout + exception bounds)
- Prevents memory leaks + infinite loops

### 4. Execution Layer (Workers)

#### Execution Worker (`/worker/execute.py`)
**Concurrency:**
- Distributed mutex: `INSERT INTO execution_locks ON CONFLICT DO NOTHING`
- Transaction T1: acquire lock + set status to EXECUTING
- Transaction T2: call adapter (out-of-transaction)
- Transaction T3: write receipt + set status to COMPLETED/FAILED, release lock

**Idempotency:**
- Check receipt.executed_at before executing (skip if already done)
- Adapter must be idempotent (use action_id as idempotency key)

**Adapter registry** (`/api/app/adapters/`):
- `BaseAdapter` ABC with `execute(action) → ExecutionResult`
- Implementations: MockStripeAdapter, AirflowAdapter, SalesforceAdapter, ZendeskAdapter, HubSpotAdapter
- All return ExecutionResult(success, result_dict, error_string)

**Execution loop:**
- Poll for APPROVED actions (batch of up to 10)
- For each action: acquire lock, verify not already executed, call adapter, record receipt
- Commit after each batch
- Sleep 1s between polls (configurable)

#### Delivery Worker (`/worker/deliver.py`)
**Polling:**
- Fetch pending/failed deliveries (with FOR UPDATE SKIP LOCKED)
- Batch size configurable (default 10)
- Exponential backoff: delay = 2^attempt_count (capped at MAX_ATTEMPTS=5)

**Webhook payload:**
```json
{
  "subscription_id": "...",
  "tenant_id": "...",
  "entity_type": "...",
  "entity_id": "...",
  "state_version": 42,
  "state": {...},
  "state_hash": "sha256...",
  "delivered_at": "2024-..."
}
```

**Retry logic:**
- 200-299: success, mark as DELIVERED
- 4xx: fail (client error, don't retry)
- 5xx: fail (mark for retry with backoff)
- Network error: fail (mark for retry)

### 5. Frontend Layer (Next.js 15)

**Console UI** (`/console/src/`):
- Next.js 15 + React 19
- Tabs: State, Timeline, Diff, Deliveries, Developers
- Entity Inspector (query by tenant_id + entity_type + entity_id)
- Time-travel view (GET /state/.../at?rev=N)

**Landing page** (`/landing/src/`):
- Marketing site (separate deployment)

### 6. SDK Layer

**Python SDK** (`/sdk/src/statis/`):
- Client class for API consumption
- Handles authentication, event posting, action proposals

**TypeScript SDK** (`/sdk-ts/src/`):
- `client.ts` — HTTP client for Node.js/browser
- `types.ts` — TypeScript types for API contracts

## Data Flow

### Event Ingestion Flow
```
POST /events
  ↓
EventIn validation (Pydantic)
  ↓
Create Event row (append-only)
  ↓
Look up reducer by event_type
  ↓
IF reducer exists:
  ├─ Load EntityState (tenant_id, entity_type, entity_id)
  ├─ Run reducer safely (sandbox + timeout)
  ├─ Optimistic concurrency: UPDATE entity_state WHERE version == old_version
  ├─ On version conflict: retry loop (MAX_MATERIALIZE_RETRIES=5)
  ├─ Enqueue deliveries to all subscriptions
  └─ Record reducer failure if error (3 failures → quarantine)
```

### Action → Approval → Execution Flow
```
POST /actions (propose action)
  ↓
Create ActionContract (status=PROPOSED)
  ↓
POST /actions/{action_id}/evaluate (policy decision)
  ├─ Load PolicyRules (filtered by action_type)
  ├─ Load EntityState (entity context)
  ├─ Load recent Events (event history)
  ├─ Run PolicyEvaluator.evaluate() (pure function)
  ├─ Get PolicyDecision (APPROVED/DENIED/ESCALATED)
  ├─ Update ActionContract.status (APPROVED/DENIED/ESCALATED)
  ├─ Create Receipt (canonical hash, audit trail)
  └─ Return EvaluateResponse (decision + receipt_id)
  ↓
[Execution Worker] Poll for APPROVED actions
  ├─ INSERT INTO execution_locks (distributed mutex)
  ├─ Check receipt.executed_at (idempotency)
  ├─ Call adapter.execute(action)
  ├─ Update Receipt.executed_at + execution_result
  ├─ Update ActionContract.status = EXECUTED/FAILED
  └─ DELETE FROM execution_locks (release lock)
```

### Webhook Delivery Flow
```
Materialized entity state
  ↓
Find all Subscriptions (filters match: entity_type, entity_id)
  ↓
Create Delivery rows (status=pending, next_attempt_at=now)
  ↓
[Delivery Worker] Poll for pending deliveries
  ├─ Load EntityState + Subscription
  ├─ Build webhook payload
  ├─ POST to subscription.destination
  ├─ On success: update status=DELIVERED
  └─ On failure: update status=FAILED, schedule retry (exponential backoff)
```

## Key Abstractions

### 1. PolicyEvaluator (Pure Function)
```python
class PolicyEvaluator:
    def evaluate(
        action: Action,
        entity_state: dict,
        event_history: list,
        rules: list[RuleSpec]
    ) → PolicyDecision
```
- **Why pure:** testable in isolation, deterministic, no side effects
- **Input contract:** action, entity_state, event_history, rules
- **Output contract:** decision (APPROVED/DENIED/ESCALATED) + reason

### 2. BaseAdapter (ABC for Execution)
```python
class BaseAdapter(ABC):
    def execute(self, action: Action) → ExecutionResult
```
- **Contract:** idempotent, use action_id as idempotency key in downstream calls
- **Output:** ExecutionResult(success, result_dict, error_string)
- **Implementations:** Stripe, Airflow, Salesforce, Zendesk, HubSpot

### 3. Reducer Functions (Pure State Transformation)
```python
def reduce_ticket_updated(state: dict, event_payload: dict) → dict
```
- **Input:** current state + event payload
- **Output:** new state (or unchanged)
- **Constraint:** pure (no side effects, no DB calls)
- **Safety:** run in sandbox with timeout + error bounds

### 4. Receipt (Audit Trail)
```python
class Receipt:
    receipt_id: str  # unique
    action_id: str  # unique (idempotency key for execution)
    decision: str  # APPROVED/DENIED/ESCALATED
    hash: str  # SHA-256 of canonical (receipt_id, action_id, decision, ...)
    execution_result: Optional[dict]
    executed_at: Optional[datetime]
```
- **Canonical fields (in hash):** receipt_id, action_id, decision, rule_id, rule_version, approved_by, executed_at, execution_result, created_at
- **Non-canonical fields (metadata only):** conditions_evaluated, entity_state_snapshot

### 5. EntityState (Versioned Materialized State)
```python
class EntityState:
    tenant_id, entity_type, entity_id  # composite PK
    state: dict  # JSONB
    state_version: int  # incremented on each reducer success
    state_hash: str  # SHA-256 for integrity
    last_event_id: str  # provenance
```
- **Optimistic concurrency:** UPDATE WHERE version == old_version
- **Deterministic:** state_hash validates no two states are identical

## Entry Points

### HTTP API (FastAPI)
- **Port:** 8000 (dev) or configurable (prod via Render/Heroku)
- **Health check:** GET /health
- **Auth:** X-API-Key header (required on all routes except /health)
- **Request flow:** route handler → FastAPI dependency injection (get_db, get_auth_context) → DB session

### Execution Worker
- **Invocation:** `python -m worker.execute` or `python worker/execute.py` (from project root)
- **Process:** infinite loop, polls every 1s (configurable)
- **Concurrency:** multiple workers OK (distributed locking handles it)

### Delivery Worker
- **Invocation:** `python -m worker.main` (or started in background thread for demos)
- **Process:** infinite loop, polls every 1s (configurable)
- **Concurrency:** single worker recommended (SKIP LOCKED prevents double delivery)

### Database Initialization
- **Alembic migrations:** `/api/alembic/versions/`
- **Invocation:** `alembic upgrade head` (from /api)
- **12 migrations:** events, entity_state, subscriptions, deliveries, api_keys, quarantine, action_contracts, policy_rules, receipts, execution_locks, etc.

### Console Frontend
- **Port:** 3001 (dev) or Vercel deployment (prod)
- **Entry:** Next.js server (SSR + client-side navigation)
- **API client:** fetch with X-API-Key header

### SDKs
- **Python SDK entry:** `from statis import Client; c = Client(api_key, base_url)`
- **TypeScript SDK entry:** `import { StatisClient } from "statis-ai"; const c = new StatisClient(...)`

## Error Handling & Resilience

### Idempotency Patterns
1. **Event ingestion:** idempotent via event_id PK
2. **Action proposal:** idempotent via action_id PK (409 on duplicate)
3. **Execution:** idempotent via action_id lock + receipt.executed_at check

### Failure Modes
1. **Reducer failure:** increment failure_count, quarantine on 3rd failure
2. **Execution failure:** receipt recorded with error, action status=FAILED
3. **Delivery failure:** exponential backoff, max 5 attempts

### Consistency Model
- **Strong consistency:** within a single entity (optimistic concurrency on state_version)
- **Eventual consistency:** across distributed workers (webhook delivery)
- **Exactly-once execution:** distributed locking + receipt idempotency key

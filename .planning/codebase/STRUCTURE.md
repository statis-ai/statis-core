# Structure

## Directory Layout

```
statis-core/
├── api/                           # FastAPI backend + database
│   ├── alembic/                   # Database migrations (SQLAlchemy Alembic)
│   │   ├── versions/              # 12 migration scripts (0001 → 0012)
│   │   └── env.py, script.py.mako
│   ├── app/                       # Application code (main entry point: main.py)
│   │   ├── main.py                # FastAPI app + CORS + router registration
│   │   ├── config.py              # Settings (DATABASE_URL)
│   │   ├── rbac.py                # Role-based filtering/redaction
│   │   ├── api/
│   │   │   ├── routes/            # 8 route modules (actions, events, receipts, etc.)
│   │   │   │   ├── actions.py     # POST/GET actions, POST evaluate
│   │   │   │   ├── events.py      # POST events (ingestion)
│   │   │   │   ├── receipts.py    # GET receipts
│   │   │   │   ├── state.py       # GET state (current + time-travel)
│   │   │   │   ├── subscriptions.py
│   │   │   │   ├── deliveries.py
│   │   │   │   ├── replay.py
│   │   │   │   └── admin.py
│   │   │   ├── deps.py            # FastAPI dependencies (get_db, get_auth_context)
│   │   │   └── __init__.py
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── __init__.py        # Exports all models
│   │   │   ├── action_contract.py # ActionContract
│   │   │   ├── event.py           # Event (append-only log)
│   │   │   ├── entity_state.py    # EntityState (materialized)
│   │   │   ├── receipt.py         # Receipt (audit trail)
│   │   │   ├── execution_lock.py  # ExecutionLock (distributed mutex)
│   │   │   ├── policy_rule.py     # PolicyRule (stored rules)
│   │   │   ├── subscription.py    # Subscription (webhooks)
│   │   │   ├── delivery.py        # Delivery (webhook attempts)
│   │   │   ├── quarantine.py      # QuarantineEntry (failed entities)
│   │   │   ├── api_key.py         # ApiKey (authentication)
│   │   │   ├── user.py            # User (console users)
│   │   │   └── escalation_review.py
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   │   ├── actions.py         # ActionIn, ActionOut, ActionStatus, etc.
│   │   │   ├── events.py          # EventIn
│   │   │   ├── receipts.py        # ReceiptOut
│   │   │   ├── policy.py          # EvaluateResponse
│   │   │   ├── state.py           # StateOut
│   │   │   ├── subscriptions.py   # SubscriptionIn/Out
│   │   │   ├── deliveries.py      # DeliveryOut
│   │   │   ├── replay.py          # ReplayResponse
│   │   │   ├── escalation.py      # EscalationReviewIn/Out
│   │   │   └── __init__.py
│   │   ├── repositories/          # Data access layer (event ingestion, state replay)
│   │   │   ├── events.py          # POST event handler + materialization logic
│   │   │   ├── state_replay.py    # Replay event sequences
│   │   │   └── __init__.py
│   │   ├── reducers/              # State transformation functions
│   │   │   ├── registry.py        # Reducer registration + lookup (with aliases)
│   │   │   ├── account.py         # 9 account domain reducers (pure functions)
│   │   │   ├── account_schema.py  # Account state schema (validation)
│   │   │   ├── sandbox.py         # Safe reducer execution (timeout + errors)
│   │   │   ├── validation.py      # Reducer output validation
│   │   │   ├── conflict_rules.py  # Conflict resolution rules
│   │   │   └── __init__.py
│   │   ├── policy/                # Policy evaluation
│   │   │   ├── evaluator.py       # PolicyEvaluator (pure function)
│   │   │   └── __init__.py
│   │   ├── adapters/              # Execution adapters (external system integration)
│   │   │   ├── base.py            # BaseAdapter ABC + ExecutionResult
│   │   │   ├── stripe_mock.py     # MockStripeAdapter (test/demo)
│   │   │   ├── airflow.py         # AirflowAdapter
│   │   │   ├── salesforce.py      # SalesforceAdapter
│   │   │   ├── zendesk.py         # ZendeskAdapter
│   │   │   ├── hubspot.py         # HubSpotAdapter
│   │   │   └── __init__.py
│   │   ├── db/                    # Database session management
│   │   │   ├── base.py            # SQLAlchemy DeclarativeBase
│   │   │   ├── session.py         # Session factory + get_db()
│   │   │   └── __init__.py
│   │   ├── utils/                 # Utilities
│   │   │   ├── hashing.py         # canonical_state_hash (SHA-256)
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── tests/                     # Test suite
│   │   ├── unit/                  # Unit tests (no DB)
│   │   │   ├── test_policy_evaluator.py
│   │   │   ├── test_receipt_hash.py
│   │   │   └── ... (10 unit tests)
│   │   ├── integration/          # Integration tests (with testcontainers[postgres])
│   │   │   └── ... (16 integration tests)
│   │   └── conftest.py
│   ├── scripts/                   # Database/utility scripts
│   │   └── init_db.py
│   ├── requirements.txt           # Python dependencies
│   ├── pyproject.toml            # Poetry/pip config (optional)
│   └── README.md
│
├── worker/                        # Background workers (execution + delivery)
│   ├── main.py                    # Delivery worker entry point
│   ├── execute.py                 # Execution worker (poll APPROVED actions)
│   ├── deliver.py                 # Webhook delivery logic (exponential backoff)
│   ├── __init__.py               # Makes worker/ a package (for -m invocation)
│   └── __pycache__
│
├── console/                       # Next.js 15 UI (Account Inspector)
│   ├── src/
│   │   ├── app/                   # Next.js app directory (pages + layout)
│   │   │   ├── page.tsx          # Root dashboard
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── [tenant]/          # Dynamic tenant routes
│   │   │   │   ├── [entity-type]/
│   │   │   │   │   └── [entity-id]/
│   │   │   │   │       └── page.tsx  # Entity inspector page
│   │   │   │   └── layout.tsx
│   │   │   └── api/               # API routes (optional: client-side only)
│   │   ├── components/            # React components
│   │   │   ├── demos/             # Demo components
│   │   │   ├── shared/            # Reusable components (Header, Footer, etc.)
│   │   │   └── ...
│   │   ├── lib/                   # Utilities (API client, hooks, etc.)
│   │   │   ├── api.ts            # Fetch wrapper + auth
│   │   │   ├── hooks.ts          # React hooks
│   │   │   └── ...
│   │   └── styles/                # Tailwind/CSS
│   ├── public/                    # Static assets
│   ├── tests/                     # Playwright E2E tests
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── node_modules/
│
├── landing/                       # Marketing landing page
│   ├── src/
│   │   ├── app/                   # Next.js app directory
│   │   ├── components/            # Landing components
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── sdk/                           # Python SDK (PyPI: statis-ai)
│   ├── src/statis/
│   │   ├── __init__.py           # Exports Client
│   │   ├── client.py             # StatisClient (HTTP client)
│   │   ├── models.py             # Type definitions
│   │   └── ...
│   ├── tests/
│   ├── pyproject.toml
│   ├── setup.py (or poetry config)
│   └── ...
│
├── sdk-ts/                        # TypeScript SDK (npm: statis-ai)
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── client.ts             # StatisClient
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── dist/                      # Compiled output (npm package)
│   └── ...
│
├── examples/                      # Example scripts + use cases
│   ├── retention_demo.py         # End-to-end CSM retention demo
│   ├── csm_demo.py               # Realistic CSM scenario
│   └── crewai/                   # CrewAI integration example
│
├── docs/                          # Architecture + integration docs
│   ├── api-reference/            # OpenAPI specs
│   ├── guides/                   # How-to guides
│   ├── overview/                 # Conceptual docs
│   ├── sdks/                     # SDK docs
│   ├── integrations/             # Third-party integrations
│   ├── images/                   # Diagrams + logos
│   ├── logo/                     # Brand assets
│   └── ...
│
├── .planning/                     # Planning & analysis
│   ├── codebase/                 # Codebase documentation
│   │   ├── ARCHITECTURE.md       # Architecture (this file)
│   │   └── STRUCTURE.md          # Directory structure (this file)
│   └── ...
│
├── memory/                        # Auto-memory files (Claude context)
│   └── MEMORY.md
│
├── scripts/                       # Utility scripts
│   ├── init_db.sh
│   └── ...
│
├── .claude/                       # Claude workspace metadata
├── .git/                          # Git repository
├── .gitignore
├── README.md                      # Main project README
├── STATUS.md                      # Living build status doc (updated on each feature)
├── CLAUDE.md                      # Claude-specific instructions
├── statis_context.md              # Cursor context + architecture notes
├── milestone.md                   # Build plan + acceptance criteria
├── render.yaml                    # Render.com deployment config
├── Procfile                       # Heroku deployment config
├── rename_script.py              # Utility script
└── LICENSE
```

## Key Files

### Entry Points
- **API:** `/api/app/main.py` (FastAPI app)
- **Execution Worker:** `/worker/execute.py` (distributed lock + adapter execution)
- **Delivery Worker:** `/worker/main.py` (webhook polling)
- **Console:** `/console/src/app/page.tsx` (Next.js root)
- **SDK (Python):** `/sdk/src/statis/client.py`
- **SDK (TypeScript):** `/sdk-ts/src/client.ts`

### Core Business Logic
- **Event Ingestion:** `/api/app/repositories/events.py` (ingestion + materialization + delivery enqueueing)
- **Policy Evaluation:** `/api/app/policy/evaluator.py` (pure, testable decision logic)
- **Reducer Registry:** `/api/app/reducers/registry.py` (dispatch event_type → reducer function)
- **Account Reducers:** `/api/app/reducers/account.py` (9 pure state transformation functions)

### Models & Schemas
- **ORM Models:** `/api/app/models/` (13 SQLAlchemy classes)
- **Pydantic Schemas:** `/api/app/schemas/` (request/response validation)
- **Dependencies:** `/api/app/api/deps.py` (FastAPI injection: get_db, get_auth_context)

### Adapters & Execution
- **Adapter Base:** `/api/app/adapters/base.py` (ABC + ExecutionResult)
- **Execution Flow:** `/worker/execute.py` (distributed locking, exactly-once semantics)
- **Webhook Delivery:** `/worker/deliver.py` (exponential backoff)

### Database
- **Migrations:** `/api/alembic/versions/` (12 migration scripts)
- **Session Management:** `/api/app/db/session.py` (session factory)
- **Database Config:** `/api/app/config.py` (DATABASE_URL)

### Testing
- **Unit Tests:** `/api/tests/unit/` (10 tests, no DB)
- **Integration Tests:** `/api/tests/integration/` (16 tests, with testcontainers)
- **Test Configuration:** `/api/tests/conftest.py`

## Naming Conventions

### Python Files & Modules
- **Models:** `{entity}.py` (e.g., `action_contract.py`, `entity_state.py`)
- **Routes:** `{domain}.py` (e.g., `actions.py`, `events.py`)
- **Schemas:** `{domain}.py` (e.g., `actions.py`, `events.py`) in `/schemas/`
- **Reducers:** `{domain}.py` (e.g., `account.py`) in `/reducers/`
- **Adapters:** `{system}.py` (e.g., `stripe_mock.py`, `salesforce.py`) in `/adapters/`
- **Tests:** `test_{module}.py` (e.g., `test_policy_evaluator.py`)

### Database Tables
- Plural or singular (convention varies): `events`, `entity_state`, `subscriptions`, `deliveries`, `action_contracts`, `policy_rules`, `receipts`, `execution_locks`
- Composite keys: `(tenant_id, entity_type, entity_id)`
- Indexes: `ix_{table}_{columns}` (e.g., `ix_events_ordering`)
- Foreign keys: `fk_{from_table}_{to_table}`

### Classes
- **Models:** PascalCase, no Model suffix (e.g., `ActionContract`, `EntityState`)
- **Schemas:** PascalCase, no Schema suffix (e.g., `ActionIn`, `ActionOut`)
- **Functions:** snake_case (e.g., `reduce_ticket_updated()`, `get_reducer()`)
- **Dataclasses:** PascalCase (e.g., `ExecutionResult`, `PolicyDecision`)
- **Routes (FastAPI):** snake_case path (e.g., `/actions/{action_id}/evaluate`)

### Variables
- **Config:** UPPER_CASE constants (e.g., `POLL_INTERVAL`, `BATCH_SIZE`, `MAX_MATERIALIZE_RETRIES`)
- **IDs:** `{entity}_id` (e.g., `action_id`, `event_id`, `tenant_id`)
- **Status enums:** PascalCase values (e.g., `PROPOSED`, `APPROVED`, `EXECUTED`)

### TypeScript/JavaScript
- **Components:** PascalCase files (e.g., `EntityInspector.tsx`)
- **Functions:** camelCase (e.g., `fetchEntityState()`)
- **Types:** PascalCase (e.g., `ActionContract`, `EntityState`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Module Organization

### By Layer (Vertical Slice)
Each feature has clear horizontal boundaries:

1. **Route** (entry point)
   - `/api/app/api/routes/actions.py`

2. **Schema** (request/response validation)
   - `/api/app/schemas/actions.py`

3. **Model** (ORM)
   - `/api/app/models/action_contract.py`

4. **Repository/Service** (business logic)
   - `/api/app/repositories/events.py`
   - `/api/app/policy/evaluator.py`

5. **Dependencies** (injection)
   - `/api/app/api/deps.py`

### By Domain (Horizontal Grouping)
Domains organize related functionality:

- **Account Domain:** reducers in `/reducers/account.py`
- **Policy Domain:** evaluator in `/policy/evaluator.py`
- **Event Domain:** ingestion in `/repositories/events.py`
- **Action Domain:** routes in `/api/routes/actions.py`
- **Execution Domain:** workers in `/worker/execute.py`
- **Delivery Domain:** workers in `/worker/deliver.py`

### By Concern (Cross-Cutting)
Shared infrastructure:

- **Authentication:** `/api/app/api/deps.py` (X-API-Key validation)
- **Database:** `/api/app/db/session.py` (session management)
- **Utilities:** `/api/app/utils/hashing.py` (SHA-256, JSON canonicalization)
- **Testing:** `/api/tests/conftest.py` (fixtures, test containers)

## Key Abstractions & Patterns

### 1. Pure Functions
- **PolicyEvaluator** — no imports of models/DB
- **Reducer functions** — receive state dict, return new state dict
- **Utilities** — hashlib, json operations

### 2. Dependency Injection (FastAPI)
- `Depends(get_db)` — injects Session
- `Depends(get_auth_context)` — injects AuthContext (tenant_id, role)

### 3. Adapter Pattern
- `BaseAdapter` ABC — contract for external system integration
- Multiple implementations — Stripe, Airflow, Salesforce, Zendesk, HubSpot

### 4. Registry Pattern
- Reducer registry — maps event_type → function (with aliases)
- Adapter registry — maps target_system → adapter instance

### 5. Distributed Locking
- `INSERT INTO execution_locks ON CONFLICT DO NOTHING`
- Prevents concurrent execution of same action

### 6. Optimistic Concurrency
- `UPDATE entity_state WHERE version == old_version`
- Retry on conflict (up to MAX_MATERIALIZE_RETRIES)

### 7. Idempotency Keys
- action_id (Receipt.action_id UNIQUE)
- event_id (Event PK)
- Subscription_id (Delivery subscription_id)

### 8. Error Isolation (Quarantine)
- 3 consecutive reducer failures → QuarantineEntry.quarantined_at set
- Prevents toxic entities from blocking event log

## Deployment

### Backend (API + Workers)
- **Host:** Render.com or Heroku
- **Process types:** `web` (FastAPI), `worker-execute` (execution), `worker-deliver` (webhooks)
- **Environment:** DATABASE_URL, API keys
- **Config:** `render.yaml` or `Procfile`

### Frontend (Console + Landing)
- **Console:** Vercel (Next.js deployment)
- **Landing:** Vercel or static hosting
- **Env:** NEXT_PUBLIC_API_URL, FRONTEND_URL

### Database
- **PostgreSQL:** 12+ (testcontainers in tests)
- **Migrations:** Alembic (auto-generated from models)
- **Backup/PITR:** Render.com managed

## Testing Strategy

### Unit Tests (10)
- `test_policy_evaluator.py` — pure function tests
- `test_receipt_hash.py` — hash stability
- No database, no network

### Integration Tests (16)
- `test_event_ingestion_*` — event log + materialization
- `test_action_*` — action contract workflow
- `test_execution_*` — distributed locking, exactly-once
- Uses testcontainers[postgres] (ephemeral DB)

### E2E Tests
- Playwright tests in `/console/tests/`
- Full stack: API + Database + Frontend

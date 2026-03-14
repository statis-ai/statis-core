# Integrations

## Databases
- **PostgreSQL** — Primary operational database
  - **Connection**: SQLAlchemy ORM with psycopg (v3) driver
  - **Migration tool**: Alembic (19 migrations)
  - **Schema**: 12 core tables (events, entity_state, subscriptions, deliveries, api_keys, quarantine, action_contracts, policy_rules, receipts, execution_locks, escalation_reviews, users)
  - **Patterns**: ACID transactions, row-level locking (SKIP LOCKED for concurrent delivery), optimistic concurrency via state_hash

## External APIs & Services

### CRM Integrations
- **Salesforce** (SalesforceAdapter)
  - Action types: `salesforce_update_record`, `salesforce_create_record`
  - Endpoints: REST API v57.0+ (sObject endpoints)
  - Auth: OAuth2 Bearer token (SALESFORCE_ACCESS_TOKEN)
  - Config: SALESFORCE_INSTANCE_URL, SALESFORCE_API_VERSION
  - Idempotency: External ID field (Statis_Action_Id__c)
  - Supported operations: PATCH (update), POST (create)

- **HubSpot** (HubSpotAdapter)
  - Endpoints: CRM API v3
  - Action types: `hubspot_update_contact`, `hubspot_create_deal`
  - Auth: Private app access token (starts with pat-)
  - Base URL: https://api.hubapi.com
  - Idempotency: `hs_unique_creation_key` field set to action_id
  - Deal associations: HUBSPOT_DEFINED category

### Support/Ticketing Integration
- **Zendesk** (ZendeskAdapter)
  - Endpoints: REST API v2
  - Action types: `zendesk_create_ticket`, `zendesk_update_ticket`
  - Auth: Basic auth with email/token (ZENDESK_EMAIL, ZENDESK_API_TOKEN)
  - Idempotency: external_id field = action_id
  - Base URL: `https://{ZENDESK_SUBDOMAIN}.zendesk.com`

### Workflow Orchestration
- **Apache Airflow** (AirflowAdapter)
  - Endpoints: Stable REST API v1
  - Action type: `airflow_dag_trigger`
  - Auth: Basic auth (username/password)
  - Idempotency: dag_run_id = action_id (Airflow rejects duplicate run IDs)
  - Config: AIRFLOW_BASE_URL, AIRFLOW_USERNAME, AIRFLOW_PASSWORD

### Payment Processor
- **Stripe** (MockStripeAdapter — mock implementation)
  - Action types: `apply_discount`, `retention_offer`
  - Returns mock charge IDs (ch_mock_*)
  - 50ms simulated latency

## Auth & API Security
- **API Key Authentication**:
  - Header-based: `X-API-Key`
  - Stored in `api_keys` table with tenant_id, role, agent_id
  - Console/landing access: Token-based validation
  - Multi-tenancy: All queries filtered by tenant_id

- **RBAC (Role-Based Access Control)**:
  - Implemented in `rbac.py` — role-based event filtering and state field redaction
  - Roles: API key role attribute determines access level
  - Principles: Field-level redaction, entity-type filtering

## Messaging / Webhooks
- **Webhook Delivery System**:
  - **Queue pattern**: events (source) → subscriptions → deliveries (sink)
  - **Worker**: webhook delivery worker in `worker/deliver.py`
  - **HTTP Client**: httpx (sync/async support, timeout: 10s)
  - **Delivery semantics**:
    - At-least-once delivery (retries on failure)
    - Exponential backoff: 2^attempt_count seconds
    - Max 5 retry attempts before dead-lettering
    - Concurrent delivery: ThreadPoolExecutor (5 workers)
  - **Deduplication**: dedupe_key on delivery record
  - **Subscription states**: active, paused, dead
  - **Payload format**: {subscription_id, tenant_id, entity_type, entity_id, state_version, state, state_hash, delivered_at}

- **Event Materialization**:
  - Append-only event log (idempotent, deterministic ordering)
  - Reducers convert events to entity state (6+ account reducers)
  - State tracked with SHA-256 hash and version number
  - Time-travel queries: GET `/state/{entity_type}/{entity_id}/at?rev=N`

## Other Services

### Execution Infrastructure
- **Execution Lock Pattern** (distributed mutex):
  - Table: execution_locks (action_id PK)
  - Insert-or-ignore for safe distributed locking
  - States: EXECUTING → COMPLETED/FAILED

- **Receipt System**:
  - Immutable audit trail for every approved action
  - Fields: receipt_id, action_id, decision, rule_id, rule_version, approved_by, executed_at, execution_result
  - Hash: SHA-256 of canonical fields for integrity
  - Written atomically with action contract status update

### Policy Engine
- **In-Memory Policy Evaluation**:
  - Pure PolicyEvaluator (no side effects)
  - Rules stored in policy_rules table (seeded per adapter/pattern)
  - Rule specs: action_type-based matching with condition evaluation
  - Condition keys: churn_risk (bool), min_ltv (int), no_discount_days (int)
  - Policies: churn_retention_v1, airflow_dag_trigger_v1, salesforce_update_v1, zendesk_create_v1, hubspot_update_v1

### Poison Pill Quarantine
- **Auto-quarantine on repeated failures**:
  - 3 reducer failures → entity quarantine (quarantine table)
  - Prevents cascading failures
  - Manual intervention required to unquarantine

### Monitoring & Observability
- **Health check**: GET `/health` → {ok: true}
- **Logging**: Python logging module (worker/API processes)
- **Tracing**: trace_id field on events (optional, for distributed tracing)

### Frontend APIs
- **Console-to-API Communication**:
  - Base URL: NEXT_PUBLIC_API_URL (env var, defaults to http://localhost:8000)
  - Auth header: X-API-Key
  - Endpoints: /state, /events, /deliveries, /actions, /receipts, /escalations, /approve, /reject

- **CORS Configuration**:
  - Frontend URL list from FRONTEND_URL env var (comma-separated)
  - Defaults: http://localhost:3000, http://localhost:3001
  - CORSMiddleware: allow_credentials=True, allow_methods=["*"], allow_headers=["*"]

## Integration Patterns
- **Adapter Registry**: Central ADAPTERS dict mapping action_type to BaseAdapter instances
- **Idempotency Keys**: Action ID used consistently across all external API calls
- **Error Handling**: ExecutionResult dataclass (success, result, error fields)
- **Async Support**: httpx for both sync and async webhook delivery
- **Timeout**: 30s for external API calls, 10s for webhook delivery
- **Retry Logic**: Exponential backoff specific to delivery system (not external API adapters)

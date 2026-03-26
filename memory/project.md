# Project State

Last updated: 2026-03-13

## What's Built (all shipped, on `main`)

### Backend — `api/`
- Append-only event log, state materialization (9 reducers), push delivery (webhooks), time-travel queries
- Multi-tenancy + RBAC-lite, poison-pill quarantine
- Four primitives: Action Contract (P1), Policy Engine (P2), Execution Guarantee (P3), Receipt/Ledger (P4)
- Escalation flow: GET /escalations, POST /approve, POST /reject, escalation_reviews table
- 18 migrations applied to production Neon DB

### Worker — `worker/execute.py`
- Polls APPROVED actions, distributed lock (execution_locks), calls adapter, writes receipt
- Post-escalation: injects reviewer metadata from escalation_reviews into execution_result
- Adapter registry: stripe, airflow, salesforce, zendesk, hubspot

### Adapters — `api/app/adapters/`
- `stripe_mock.py` — MockStripeAdapter (retention_offer, apply_discount)
- `airflow.py` — AirflowAdapter (airflow_dag_trigger, action_id as dag_run_id)
- `salesforce.py` — SalesforceAdapter (salesforce_update_record, salesforce_create_record)
- `zendesk.py` — ZendeskAdapter (zendesk_create_ticket, zendesk_update_ticket)
- `hubspot.py` — HubSpotAdapter (hubspot_update_contact, hubspot_create_deal)

### Policy Engine — `api/app/policy/evaluator.py`
- Pure, zero DB imports
- 8 seeded rules: churn_retention_v1, airflow_dag_trigger_v1, 2x salesforce, 2x zendesk, 2x hubspot
- All operator_approved=true rules active in production

### Tests
- 149 unit tests (`api/tests/unit/`) — all passing
- 16 integration tests (`testcontainers[postgres]`)

### Python SDK — `sdk/`
- PyPI: `statis-ai@0.1.0` — published
- `StatisClient`, `Receipt`, `ActionDeniedError`, `ActionEscalatedError`, `ActionTimeoutError`, `StatisError`
- 11 unit tests (respx mocks)

### TypeScript SDK — `sdk-ts/`
- npm: `statis-ai@0.1.0` — published
- Same surface as Python SDK, zero runtime deps, native fetch (Node 18+)
- 11 unit tests (Node built-in test runner)

### Console — `console/`
- Next.js 15 / React 19 / Tailwind
- 7 inspector tabs: State, Timeline, Diff, Deliveries, Actions, Receipt, Developers
- Escalation panel with approve/reject UI

### Landing — `landing/`
- Next.js 15 / Framer Motion
- Full marketing page, merged to main

### Docs — `docs/`
- Mintlify format (mint.json + MDX)
- Guides (intro, quickstart, 4 primitives, escalation, adapters, console)
- SDK reference (Python + TypeScript)
- API reference (8 endpoint pages)
- NOT YET deployed — needs Mintlify account connection + docs.statis.dev CNAME

## What's Next

- [ ] Deploy docs site (Mintlify → docs.statis.dev)
- [ ] VPC / self-hosted deployment option
- [ ] More real adapters (Salesforce OAuth, HubSpot OAuth)

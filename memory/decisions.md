# Architectural & Product Decisions

Last updated: 2026-03-13

## Naming

- **PyPI package:** `statis-ai` (not `statis` — taken by abandoned 2020 project; not `statis-sdk`)
- **npm package:** `statis-ai` (same name as PyPI for consistency)
- **Python import:** `from statis import StatisClient` (import name stays `statis`)
- **Confirmed free on PyPI:** checked via `https://pypi.org/pypi/statis-ai/json` returning 404 before publish

## SDK Design

- `execute()` is a single blocking call: propose → evaluate → poll → return receipt
- `ActionEscalatedError` raised **immediately** when ESCALATED — agents do not block waiting for humans
- `agent_id` param maps to `proposed_by` on the wire (cleaner for agent-facing API)
- `action_id` auto-generated as `statis-{uuid4}` if not provided
- Python SDK uses `httpx` (sync); TypeScript SDK uses native `fetch` (zero runtime deps)

## Adapter Design

- All adapters use stdlib `urllib` only — no new runtime dependencies
- `action_id` is always the idempotency key passed to the external system:
  - Airflow: `dag_run_id`
  - Salesforce create: `Statis_Action_Id__c` custom field
  - Zendesk create: `external_id`
  - HubSpot create deal: `hs_unique_creation_key`
- 409 from external system = idempotent success (already done), not an error

## Policy Engine

- Fail-closed: no matching rule → DENIED
- Conditions are a conjunction (AND) within a rule; add multiple rules for OR semantics
- `operator_approved` reads from `action.context` (caller attestation), NOT entity state
  - This required threading `action` parameter through `evaluate()` → `_conditions_met()` → `_check()`

## Database

- `execution_locks` PK on `action_id` = distributed mutex (INSERT ON CONFLICT DO NOTHING)
- psycopg3 `rowcount` unreliable for INSERT ON CONFLICT — use `.returning()` + `fetchone() is not None`
- `alembic_version.version_num` was VARCHAR(32) on Neon — widened to VARCHAR(256) to support long revision IDs
- Receipts written atomically with action status update in single commit (T3)

## Escalation

- `escalation_reviews` has UNIQUE on `action_id` — one review per action
- Worker injects reviewer metadata into `execution_result` before writing receipt — full traceability chain
- Console approve/reject uses `reviewer_id` (free text) — no auth coupling

## Architecture

- Worker, API, Console are separate processes — worker polls, doesn't subscribe
- Three-transaction pattern in worker: T1 (lock + EXECUTING) → T2 (adapter call) → T3 (receipt + status + release)
- `SKIP LOCKED` on deliveries queue allows concurrent workers without contention

## Docs

- Chose Mintlify over Docusaurus/Nextra — hosted, zero config, looks good for developer API docs
- Old `docs/` content was entirely stale ("Semantic Bus" era) — full rewrite in this session
- Indigo/violet color scheme (#6366f1) to match landing page gradient

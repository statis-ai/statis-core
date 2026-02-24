---
name: Milestone1 Events Ingestion
overview: "Implement Milestone 1 in a new minimal `api/` service: append-only `events` ingestion with idempotency, deterministic ordering keys, tests, and curl docs, without materialized state."
todos:
  - id: scaffold-api
    content: Create minimal api/ service scaffold with FastAPI, SQLAlchemy, Alembic, and pytest setup
    status: completed
  - id: events-schema-migration
    content: Define events ORM model and Alembic migration with unique event_id and ordering index
    status: completed
  - id: post-events-endpoint
    content: Implement POST /events validation and idempotent insert behavior (201 first, 200 duplicate)
    status: completed
  - id: tests-m1
    content: Add unit and integration tests for validation, idempotency, and deterministic count/order checks
    status: completed
  - id: docs-curl
    content: Add docs curl examples for success, duplicate idempotency, and validation failure
    status: completed
isProject: false
---

# Milestone 1 — Append-Only Event Ingestion

## Scope and decisions

- Build a minimal FastAPI service under `[/Users/ankumar/statis/api/](/Users/ankumar/statis/api/)` only.
- `POST /events` behavior:
  - first insert: `201 Created`
  - duplicate `event_id`: `200 OK`
  - both return `{ "accepted": true, "event_id": "..." }`.
- Do not implement `entity_state` or reducers yet.

## Implementation plan

- Scaffold minimal API project structure and runtime/test dependencies in `[/Users/ankumar/statis/api/](/Users/ankumar/statis/api/)` (FastAPI, SQLAlchemy, Alembic, psycopg, pytest).
- Add DB model for append-only `events` table in `[/Users/ankumar/statis/api/...](/Users/ankumar/statis/api/)` with required columns from `STATIS_CONTEXT.md`:
  - unique constraint on `event_id` (idempotency)
  - deterministic ordering fields present: `occurred_at`, `ingested_at`, `event_id`
  - composite index for ordered reads: `(occurred_at, ingested_at, event_id)`.
- Create Alembic setup and migration under `[/Users/ankumar/statis/api/alembic/](/Users/ankumar/statis/api/alembic/)` to create the `events` table and indexes.
- Implement `POST /events` route in `[/Users/ankumar/statis/api/...](/Users/ankumar/statis/api/)` with Pydantic validation for required request fields and optional `trace_id`.
- Implement idempotent insert logic (DB-enforced via unique `event_id` + graceful duplicate handling) so duplicate submits return accepted without a second row.
- Add unit tests in `[/Users/ankumar/statis/api/tests/unit/](/Users/ankumar/statis/api/tests/unit/)` for:
  - required field validation failures
  - accepted happy path
  - duplicate `event_id` returns `200` and does not increment row count.
- Add integration test in `[/Users/ankumar/statis/api/tests/integration/](/Users/ankumar/statis/api/tests/integration/)` against Postgres that inserts multiple events and verifies:
  - expected row count
  - deterministic ordering by `(occurred_at, ingested_at, event_id)`.
- Update docs with curl examples in `[/Users/ankumar/statis/docs/](/Users/ankumar/statis/docs/)` including:
  - first successful insert (`201`)
  - duplicate idempotent re-submit (`200`)
  - validation error example.

## Acceptance checks

- Alembic migration applies cleanly and creates `events` with constraints/indexes.
- `POST /events` returns correct statuses (`201` first insert, `200` duplicate).
- Unit + integration tests pass for validation, idempotency, and count/order assertions.
- Docs contain runnable curl samples for core ingestion flows.


# Milestone 1 — Completed

**Append-only event ingestion (idempotent)**

Reference: [STATIS_CONTEXT.md](../statis_context.md), [milestone.md](../milestone.md).

---

## Scope completed

- **POST /events** and the **events** table in Postgres (Alembic migrations).
- **Validation**: Required fields enforced via Pydantic; invalid requests return 422.
- **Idempotency**: Same `event_id` returns accepted without duplicating; first insert → `201 Created`, duplicate → `200 OK`; both return `{ "accepted": true, "event_id": "..." }`.
- **Deterministic ordering**: Table has `occurred_at`, `ingested_at`, `event_id` and a composite index `(occurred_at, ingested_at, event_id)` for ordered reads.
- **Unit tests**: Validation and idempotency behavior.
- **Integration test**: Inserts events, verifies count and deterministic order.
- **Docs**: Example curl requests in [docs/api.md](api.md).
- **Out of scope**: No state materialization (deferred to Milestone 2).

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| FastAPI app + health | `api/app/main.py` |
| Events table migration | `api/alembic/versions/0001_create_events_table.py` |
| Events ORM model | `api/app/models/event.py` |
| POST /events route | `api/app/api/routes/events.py` |
| Request/response schemas | `api/app/schemas/events.py` |
| Idempotent insert | `api/app/repositories/events.py` |
| DB session/config | `api/app/db/session.py`, `api/app/config.py` |
| Unit tests | `api/tests/unit/test_event_validation.py`, `api/tests/unit/test_event_idempotency.py` |
| Integration test | `api/tests/integration/test_event_ingestion.py` |
| API + curl docs | `docs/api.md` |

---

## Key implementation details

- **Events table**: `event_id` (PK/unique), `entity_type`, `entity_id`, `event_type`, `payload` (JSONB), `occurred_at`, `ingested_at` (server default `now()`), `producer`, `schema_version`, `trace_id` (optional). Index `ix_events_ordering` on `(occurred_at, ingested_at, event_id)`.
- **Idempotency**: Repository catches `IntegrityError` on insert; duplicate `event_id` causes rollback and returns `False` so the route responds 200 with the same body.
- **Unit tests**: Use a fake DB dependency override so no real Postgres is required; idempotency tests mock `insert_event_idempotent` to assert 201 vs 200 and response body.

---

## How to run

From repo root:

```bash
cd api
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg://USER:PASS@HOST:PORT/DB"  # optional; default local
alembic upgrade head
uvicorn app.main:app --reload
```

- **Unit tests** (no DB): `pytest tests/unit -v`
- **Integration tests** (Postgres + testcontainers): `pytest tests/integration -v -m integration`

---

## Acceptance checks (met)

- [x] Alembic migration applies and creates `events` with constraints and ordering index.
- [x] POST /events returns 201 on first insert and 200 on duplicate `event_id` with same response shape.
- [x] Unit tests cover validation (missing required field → 422) and idempotency (201 vs 200, body).
- [x] Integration test inserts events and verifies row count and ordering by `(occurred_at, ingested_at, event_id)`.
- [x] Docs include curl examples for first insert, duplicate submit, and validation error.

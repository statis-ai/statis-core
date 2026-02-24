# Milestone 2 — Completed

**Deterministic materialized state**

Reference: [STATIS_CONTEXT.md](../statis_context.md), [milestone.md](../milestone.md).

---

## Scope completed

- **entity_state table** with Alembic migration (composite PK, JSONB state, state_hash, provenance).
- **Reducer framework**: Pure-function registry mapping `event_type -> reducer(state, event) -> new_state`.
- **Demo reducers**: `ticket.updated` (merge into tickets map) and `plan.changed` (set plan field).
- **Canonical hashing**: SHA-256 of sorted-key compact JSON for deterministic `state_hash`.
- **Materialize-on-write**: `POST /events` now materializes entity_state inline in the same transaction (`SELECT FOR UPDATE`, reducer, upsert).
- **GET /state/{entity_type}/{entity_id}**: Returns state, version, hash, last_event_id, and provenance; 404 if not found.
- **Unit tests**: Reducers (empty state, existing state, immutability, determinism, registry) and hashing (key-order stability, uniqueness).
- **Integration tests**: Determinism (identical `state_hash` across entities), provenance, duplicate-event safety, ordering, 404.
- **Docs**: Reducer contract, hashing rule, materialize-on-write flow, and concurrency model documented in [docs/architecture.md](architecture.md).
- **Out of scope**: Subscriptions, delivery worker, replay, time-travel (deferred to later milestones).

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| entity_state migration | `api/alembic/versions/0002_create_entity_state_table.py` |
| EntityState ORM model | `api/app/models/entity_state.py` |
| Reducer registry | `api/app/reducers/registry.py` |
| Account reducers | `api/app/reducers/account.py` |
| Canonical hashing util | `api/app/utils/hashing.py` |
| Materialize-on-write | `api/app/repositories/events.py` |
| GET /state route | `api/app/api/routes/state.py` |
| State response schema | `api/app/schemas/state.py` |
| Unit tests (reducers) | `api/tests/unit/test_reducers.py` |
| Unit tests (hashing) | `api/tests/unit/test_hashing.py` |
| Integration tests | `api/tests/integration/test_materialization.py` |
| Architecture docs | `docs/architecture.md` |
| Modified: main.py | `api/app/main.py` (state router wired) |
| Modified: alembic env | `api/alembic/env.py` (entity_state model import) |

---

## Key implementation details

- **entity_state table**: Composite PK `(entity_type, entity_id)`. `state_version` starts at 1 and increments with each materialization. `provenance_event_ids` is a JSONB array of all event_ids that contributed to the current state. `last_event_id` has an FK back to `events`.
- **Reducers**: Pure functions that deep-copy input state and return a new dict. `ticket.updated` merges payload into `state["tickets"][ticket_id]`. `plan.changed` sets `state["plan"]` from `payload["plan"]`. If no reducer is registered for an `event_type`, the event is stored but state is not materialized.
- **Materialize-on-write**: After `flush()`ing the event insert, `_materialize()` acquires a `SELECT FOR UPDATE` lock on the entity_state row, runs the reducer, computes the hash, and upserts — all before the final `commit()`. Duplicate events (idempotent path) skip materialization entirely.
- **Concurrency**: `SELECT ... FOR UPDATE` serializes concurrent writes to the same entity, preventing race conditions at the cost of per-entity write throughput.

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

- [x] Alembic migration 0002 applies and creates `entity_state` with composite PK, FK, and all columns.
- [x] Reducer framework maps `event_type` to pure functions; `ticket.updated` and `plan.changed` registered.
- [x] `POST /events` materializes entity_state synchronously on successful insert; duplicates skip materialization.
- [x] `GET /state/{entity_type}/{entity_id}` returns state, version, hash, last_event_id, and provenance (404 if missing).
- [x] Unit tests verify reducer correctness (empty/existing state, immutability, determinism) and hashing stability.
- [x] Integration tests verify determinism (identical `state_hash`), provenance list, idempotency safety, and 404 behavior.
- [x] Reducer behavior documented in `docs/architecture.md`.

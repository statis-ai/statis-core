# Milestone 3 — Completed

**Subscriptions + Delivery Queue + Worker**

Reference: [STATIS_CONTEXT.md](../STATIS_CONTEXT.md), [milestone.md](../milestone.md).

---

## Scope completed

- Subscriptions table with entity_type/event_types filtering and active/paused status
- Deliveries table with dedupe_key unique constraint and poll-friendly index
- Delivery enqueue-on-state-change within the same transaction as event ingestion
- Subscription CRUD API (create, list, get, pause, resume)
- Delivery trace endpoint (`GET /delivery-trace/{subscription_id}`)
- Standalone delivery worker with 1-second poll loop, webhook POST, exponential backoff, and DLQ after 5 attempts
- Subscription templates with 3 example JSON configs
- Full test coverage: 7 unit tests for enqueue logic, 9 subscription API integration tests, 9 delivery flow integration tests, 3 worker integration tests (send, retry, DLQ)
- **Out of scope**: Predicate-based filtering (e.g. "only when health_score < 50"), delivery batching, per-subscription retry policy configuration

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Subscriptions migration | `api/alembic/versions/0003_create_subscriptions_table.py` |
| Deliveries migration | `api/alembic/versions/0004_create_deliveries_table.py` |
| Subscription ORM model | `api/app/models/subscription.py` |
| Delivery ORM model | `api/app/models/delivery.py` |
| Enqueue logic | `api/app/repositories/events.py` (`_enqueue_deliveries`) |
| Subscription schemas | `api/app/schemas/subscriptions.py` |
| Delivery schemas | `api/app/schemas/deliveries.py` |
| Subscription API routes | `api/app/api/routes/subscriptions.py` |
| Delivery trace route | `api/app/api/routes/deliveries.py` |
| Worker entry point | `worker/main.py` |
| Worker delivery logic | `worker/deliver.py` |
| Subscription templates | `examples/subscription_templates/` (3 JSON + README) |
| Unit tests — enqueue | `api/tests/unit/test_enqueue_deliveries.py` |
| Integration tests — subscriptions | `api/tests/integration/test_subscriptions_api.py` |
| Integration tests — delivery flow | `api/tests/integration/test_delivery_flow.py` |
| Integration tests — worker | `api/tests/integration/test_worker.py` |
| Architecture docs | `docs/architecture.md` (updated with subscription, delivery, worker sections) |

---

## Key implementation details

- **Same-transaction enqueue**: `_enqueue_deliveries` runs inside the same DB transaction as event insertion and state materialization, guaranteeing that deliveries are only created when state actually changes.
- **Dedupe via ON CONFLICT DO NOTHING**: The `dedupe_key` (`{subscription_id}:{entity_type}:{entity_id}:{state_version}`) prevents duplicate deliveries without additional application-level locking.
- **FOR UPDATE SKIP LOCKED**: The worker uses `SKIP LOCKED` so multiple worker instances can run concurrently without contention.
- **Exponential backoff**: `2^attempt_count` seconds between retries (2s, 4s, 8s, 16s), then dead-lettered at attempt 5.
- **Worker uses shared models**: The worker imports ORM models from `api/app/` via `sys.path` manipulation, avoiding code duplication.
- **Alembic env.py fix**: Changed `env.py` to not override the SQLAlchemy URL when it's already set by the test harness, fixing a testcontainers compatibility issue.

---

## How to run

```bash
# Install dependencies
cd api && pip install -r requirements.txt && pip install httpx

# Run migrations
cd api && alembic upgrade head

# Start API
cd api && uvicorn app.main:app --reload

# Start worker (in a separate terminal)
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/statis" python3 worker/main.py

# Run tests
cd api && python3 -m pytest tests/ -v --timeout=120
```

---

## Acceptance checks (met)

- [x] Subscriptions table created via Alembic migration with entity_type, event_types, destination, status
- [x] Deliveries table created via Alembic migration with dedupe_key unique constraint and poll index
- [x] Delivery enqueue happens in same transaction as event ingestion and state materialization
- [x] Subscription CRUD API: POST, GET list, GET one, pause, resume
- [x] Delivery trace endpoint returns deliveries newest-first with status, attempt_count, errors
- [x] Worker polls pending/failed deliveries with FOR UPDATE SKIP LOCKED
- [x] Worker POSTs entity state JSON to subscription destination
- [x] Worker retries with exponential backoff on failure
- [x] Worker dead-letters after 5 failed attempts
- [x] Dedupe key prevents duplicate deliveries
- [x] Paused subscriptions do not receive deliveries
- [x] Event type filtering works correctly
- [x] All 85 tests pass (61 unit + 24 integration)

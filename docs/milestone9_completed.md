# Milestone 9 — Completed

**Concurrency, Scale & Safety**

Reference: [STATIS_CONTEXT.md](../statis_context.md), [milestone.md](../milestone.md).

---

## Scope completed
- Replaced `SELECT FOR UPDATE` with optimistic concurrency (version-checked UPDATE + retry loop) in `_materialize()`.
- Created reducer sandboxing with configurable timeout via `ThreadPoolExecutor`.
- Implemented poison-pill DLQ: quarantine table, failure tracking, automatic quarantine after 3 failures.
- Added Pydantic output validation for reducer state (AccountStateV2 schema).
- Upgraded batch worker with configurable `BATCH_SIZE` env var and concurrent webhook delivery via `ThreadPoolExecutor(max_workers=5)`.
- **Out of scope**: OpenTelemetry trace propagation (Milestone 11), predicate-based subscriptions (Milestone 10).

---

## Deliverables

| Deliverable | Location |
|----|------|
| Optimistic concurrency in `_materialize()` | `api/app/repositories/events.py` |
| Reducer sandbox (timeout + error wrapping) | `api/app/reducers/sandbox.py` |
| Reducer output validation (Pydantic) | `api/app/reducers/validation.py` |
| Quarantine model (poison-pill DLQ) | `api/app/models/quarantine.py` |
| Quarantine migration | `api/alembic/versions/0008_create_quarantine_table.py` |
| Concurrent batch delivery | `worker/deliver.py` |
| Configurable batch size | `worker/main.py` |
| Concurrency integration test | `api/tests/integration/test_concurrency.py` |
| Sandbox & validation unit tests | `api/tests/unit/test_sandbox.py` |
| Batch worker unit tests | `api/tests/unit/test_batch_worker.py` |

---

## Key implementation details

- **Optimistic concurrency**: INSERT path uses ORM `db.add()` inside a `begin_nested()` savepoint, catching `IntegrityError` on conflict. UPDATE path uses Core SQL `update().where(state_version == expected)` with `synchronize_session=False` to avoid ORM identity-map side effects, followed by `db.expire(row)` + `db.refresh(row)`. Retry loop: 5 attempts with exponential backoff (`0.05 * 2^attempt` seconds).
- **Sandbox**: Wraps reducer in `concurrent.futures.ThreadPoolExecutor(max_workers=1)` with a configurable timeout (default 5s). Raises `ReducerTimeoutError` or `ReducerError`.
- **Poison-pill**: Quarantine entries track `failure_count` per `(tenant_id, entity_type, entity_id)`. At threshold (3), `quarantined_at` is set and subsequent materializations for that entity are skipped.
- **Output validation**: Only validates states with `schema_version == "account.v2"`. Uses `model_validate()` for Pydantic v2 and returns the original dict unchanged on success.
- **Batch worker**: `process_batch()` separates payload preparation (single-threaded, DB reads) from HTTP delivery (multi-threaded, up to 5 workers). Shared `httpx.Client` reuses connections within a batch.

---

## How to run

```bash
# Install dependencies
cd api && pip install -r requirements.txt

# Run migrations (requires DATABASE_URL)
cd api && alembic upgrade head

# Start API
cd api && uvicorn app.main:app --reload

# Start worker
cd worker && python main.py

# Run all tests
cd api && python -m pytest tests/ -v
```

---

## Acceptance checks (met)
- [x] Successfully ingest 100 concurrent events for the same entity without transaction deadlocks
- [x] All 100 events ingested, final `state_version` correct (verified by `test_concurrent_events_no_deadlock`)
- [x] Worker processes N deliveries per poll cycle with configurable batch size
- [x] Slow reducer is killed after timeout threshold (verified by `test_sandbox_timeout_kills_slow_reducer`)
- [x] Reducer that always raises is quarantined after 3 attempts (verified by `test_quarantine_after_three_failures`)
- [x] Pydantic validation rejects invalid reducer output (verified by `test_validate_invalid_v2_state_raises`)
- [x] All 146 tests pass (79 unit + 67 integration)

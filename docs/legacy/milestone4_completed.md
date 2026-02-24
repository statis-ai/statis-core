# Milestone 4 — Completed

**Replay + Time Machine (Admin)**

Reference: [STATIS_CONTEXT.md](../STATIS_CONTEXT.md), [milestone.md](../milestone.md).

---

## Scope completed

- `GET /events` query endpoint with entity_type, entity_id, since, until, and limit filters
- `GET /state/{entity_type}/{entity_id}/at?rev=` time-machine endpoint that recomputes state at any historical revision
- `POST /replay` delivery backfill endpoint with subscription_id, entity_type, entity_id, from_rev, to_rev
- Reusable `compute_state_at_rev()` and `replay_all()` pure functions for state reconstruction
- Rebuild-from-scratch determinism test proving deleted state can be reconstructed identically from the event log
- Full test coverage: 9 unit tests for replay functions, 8 events query integration tests, 8 time-machine integration tests (including rebuild determinism), 7 replay integration tests
- **Out of scope**: `GET /state/.../diff?from_rev=&to_rev=` (planned for future), `at?ts=` timestamp-based time travel, caching of historical state snapshots

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Events query endpoint | `api/app/api/routes/events.py` (`GET /events`) |
| EventOut schema | `api/app/schemas/events.py` |
| State replay pure functions | `api/app/repositories/state_replay.py` |
| Time-machine endpoint | `api/app/api/routes/state.py` (`GET /state/.../at?rev=`) |
| Replay schemas | `api/app/schemas/replay.py` |
| Replay endpoint | `api/app/api/routes/replay.py` (`POST /replay`) |
| Unit tests — replay functions | `api/tests/unit/test_state_replay.py` |
| Integration tests — events query | `api/tests/integration/test_events_query.py` |
| Integration tests — time machine | `api/tests/integration/test_time_machine.py` |
| Integration tests — replay | `api/tests/integration/test_replay.py` |
| Architecture docs | `docs/architecture.md` (updated with events query, time-machine, replay sections) |

---

## Key implementation details

- **No historical state snapshots**: The time-machine endpoint recomputes state on demand by replaying events through reducers. The `provenance_event_ids` array stored in `entity_state` serves as the ordered index of state-changing events, so `provenance_event_ids[:rev]` gives the exact events needed for any revision.
- **Deterministic reconstruction**: The rebuild-from-scratch test deletes the `entity_state` row, fetches all events in deterministic order `(occurred_at, ingested_at, event_id)`, replays them through reducers, and verifies every intermediate `state_hash` matches the original. This proves the system's determinism guarantee.
- **Replay dedupe**: The replay endpoint pre-checks existing dedupe keys in a single batch query before inserting, avoiding reliance on `rowcount` from `INSERT ... ON CONFLICT DO NOTHING` which can be unreliable across driver versions.
- **Clamped revision range**: `from_rev`/`to_rev` are clamped to `[1, state_version]` rather than returning an error, making the API forgiving for callers that don't know the exact version range.

---

## How to run

```bash
# Install dependencies
cd api && pip install -r requirements.txt && pip install httpx

# Run migrations
cd api && alembic upgrade head

# Start API
cd api && uvicorn app.main:app --reload

# Query events
curl "http://localhost:8000/events?entity_type=account&limit=10"

# Time machine: state at revision 3
curl "http://localhost:8000/state/account/acc_1/at?rev=3"

# Replay: backfill a subscription
curl -X POST http://localhost:8000/replay \
  -H "Content-Type: application/json" \
  -d '{"subscription_id": "...", "from_rev": 1, "to_rev": 5}'

# Run tests
cd api && python3 -m pytest tests/ -v --timeout=120
```

---

## Acceptance checks (met)

- [x] `GET /events` query endpoint returns events in deterministic order with filters
- [x] `GET /state/{entity_type}/{entity_id}/at?rev=` returns reconstructed state at any revision
- [x] State at max rev matches current `GET /state` response (hash identity)
- [x] `POST /replay` enqueues deliveries for specified subscription and version range
- [x] Replay dedupe: replaying again produces 0 new deliveries
- [x] Replay validates subscription exists and is active (404/409)
- [x] Rebuild from scratch: delete entity_state, recompute from events, hashes match at every revision
- [x] Demo question answered: "What did Sales know when it paused?" via `state_at(rev)` + provenance + delivery trace
- [x] All 117 tests pass (70 unit + 47 integration)

# Statis Architecture

## Overview

Statis materializes entity state **synchronously on write**. When `POST /events` ingests a new event, the entity's materialized state is updated within the same request and database transaction before returning a response to the caller.

## Materialize-on-write flow

1. Validate the incoming event payload (Pydantic).
2. Insert the event into the append-only `events` table (idempotent via unique `event_id`).
3. If the event is a duplicate, return `200 OK` immediately — no state change.
4. `SELECT ... FOR UPDATE` the `entity_state` row for `(entity_type, entity_id)`.
5. Look up the registered reducer for the event's `event_type`.
6. Compute `new_state = reducer(old_state, event)`.
7. Compute `state_hash = sha256(canonical_json(new_state))`.
8. Upsert `entity_state` with incremented `state_version`, updated `provenance_event_ids`, `last_event_id`, `last_occurred_at`, and `materialized_at`.
9. Commit the transaction.
10. Return `201 Created`.

After the response, `GET /state/{entity_type}/{entity_id}` immediately reflects the new state.

## Reducer contract

Every reducer is a **pure function**:

```
reducer(current_state: dict, event: Event) -> new_state: dict
```

Rules:

- No randomness.
- No `datetime.now()` or any time-dependent logic.
- No side effects (no DB calls, no network, no logging with mutable state).
- Must not mutate `current_state` — always return a new dict.
- Given the same `(current_state, event)`, must always produce the same `new_state`.

## Registered event types

| event_type       | Reducer                  | Behavior                                                             |
|------------------|--------------------------|----------------------------------------------------------------------|
| `ticket.updated` | `reduce_ticket_updated`  | Merges `payload` into `state["tickets"][ticket_id]`                  |
| `plan.changed`   | `reduce_plan_changed`    | Sets `state["plan"]` from `payload["plan"]`                          |

If an event has no registered reducer, ingestion succeeds but no state materialization occurs.

## Canonical JSON hashing

`state_hash` is the SHA-256 hex digest of the canonical JSON representation of the state:

- Keys sorted recursively.
- Compact separators: `(",", ":")`.
- UTF-8 encoding.

This guarantees that two identical state dicts always produce the same hash, regardless of Python dict insertion order.

## Deterministic ordering

Events for a given entity are ordered by:

```
(occurred_at ASC, ingested_at ASC, event_id ASC)
```

This composite key provides stable tie-breaking so that replaying the same event set always produces the same final state and `state_hash`.

## Concurrency model

The `SELECT ... FOR UPDATE` on the `entity_state` row serializes concurrent writes to the same entity. This prevents race conditions where two events for the same `(entity_type, entity_id)` could produce an inconsistent state. The lock is held for the duration of the transaction (event insert + state upsert).

Trade-off: this limits write throughput per entity, which is acceptable for MVP.

## Entity state schema

| Column                | Type              | Description                                      |
|-----------------------|-------------------|--------------------------------------------------|
| `entity_type`         | string (PK)       | e.g. "account"                                   |
| `entity_id`           | string (PK)       | e.g. "acc_123"                                   |
| `state`               | JSONB             | Current materialized state                       |
| `state_version`       | integer           | Monotonically increasing, starts at 1            |
| `last_event_id`       | string (FK)       | Most recent event applied                        |
| `last_occurred_at`    | timestamptz       | `occurred_at` of most recent event               |
| `state_hash`          | string            | SHA-256 hex of canonical JSON state              |
| `materialized_at`     | timestamptz       | When this version was materialized               |
| `provenance_event_ids`| JSONB array       | Ordered list of all event_ids that built state   |

---

## Subscriptions

A **subscription** declares interest in state changes for a given `entity_type`. Optionally it filters on specific `event_types`. When a matching event causes state materialization, a delivery is enqueued in the same transaction.

### Subscription schema

| Column            | Type           | Description                                         |
|-------------------|----------------|-----------------------------------------------------|
| `subscription_id` | string (PK)    | Server-generated UUID                               |
| `entity_type`     | string         | Filter dimension (e.g. "account")                   |
| `event_types`     | JSONB array    | Optional filter; `null` matches all event types     |
| `destination`     | string         | Webhook URL to receive state payloads               |
| `status`          | string         | `active` or `paused`                                |
| `created_at`      | timestamptz    | When the subscription was created                   |

### API

| Endpoint                                | Method | Description            |
|-----------------------------------------|--------|------------------------|
| `/subscriptions`                        | POST   | Create subscription    |
| `/subscriptions`                        | GET    | List all subscriptions |
| `/subscriptions/{id}`                   | GET    | Get one subscription   |
| `/subscriptions/{id}/pause`             | POST   | Set status to paused   |
| `/subscriptions/{id}/resume`            | POST   | Set status to active   |

### Filter semantics

- A subscription with `event_types: null` matches **all** events for the given `entity_type`.
- A subscription with `event_types: ["plan.changed", "ticket.updated"]` only matches those specific event types.
- Paused subscriptions are excluded from delivery enqueue.

---

## Delivery queue

When `POST /events` materializes state, matching active subscriptions trigger delivery rows to be inserted in the **same database transaction**. This guarantees at-least-once delivery semantics without a separate message broker.

### Delivery schema

| Column            | Type           | Description                                              |
|-------------------|----------------|----------------------------------------------------------|
| `delivery_id`     | string (PK)    | Server-generated UUID                                    |
| `subscription_id` | string (FK)    | Which subscription this delivery is for                  |
| `entity_type`     | string         | Entity type being delivered                              |
| `entity_id`       | string         | Entity ID being delivered                                |
| `state_version`   | integer        | The version of entity state being delivered              |
| `dedupe_key`      | string (unique)| `{subscription_id}:{entity_type}:{entity_id}:{state_version}` |
| `status`          | string         | `pending` / `sent` / `failed` / `dead`                   |
| `attempt_count`   | integer        | Number of failed attempts so far                         |
| `next_attempt_at` | timestamptz    | When the next delivery attempt is eligible               |
| `last_error`      | text           | Error message from most recent failure                   |
| `sent_at`         | timestamptz    | When successfully delivered                              |
| `response_code`   | integer        | HTTP status code from the webhook response               |
| `created_at`      | timestamptz    | When the delivery was enqueued                           |

### Dedupe mechanism

The `dedupe_key` column (`{subscription_id}:{entity_type}:{entity_id}:{state_version}`) has a unique constraint. `INSERT ... ON CONFLICT DO NOTHING` prevents duplicate deliveries when the same event is reprocessed or when concurrent requests try to enqueue the same delivery.

### Delivery lifecycle

```
pending ──(success)──→ sent
   │
   └──(failure)──→ failed ──(retry success)──→ sent
                     │
                     └──(5 attempts)──→ dead (DLQ)
```

### Delivery trace

`GET /delivery-trace/{subscription_id}?limit=20` returns the most recent deliveries for a subscription, ordered newest-first, including `status`, `attempt_count`, `last_error`, `sent_at`, and `response_code`.

---

## Delivery worker

A standalone Python process (`worker/main.py`) polls the `deliveries` table and sends webhooks.

### Poll loop

1. Every 1 second: `SELECT ... FROM deliveries WHERE status IN ('pending','failed') AND next_attempt_at <= now() ORDER BY next_attempt_at LIMIT 10 FOR UPDATE SKIP LOCKED`
2. For each delivery: load the current `entity_state`, POST JSON to `subscription.destination`.
3. On HTTP 2xx: set `status='sent'`, record `sent_at` and `response_code`.
4. On error: increment `attempt_count`, compute `next_attempt_at` with exponential backoff.
5. After 5 failed attempts: set `status='dead'` (dead-letter queue).

### Exponential backoff

`next_attempt_at = now() + 2^attempt_count seconds`

| Attempt | Delay  |
|---------|--------|
| 1       | 2s     |
| 2       | 4s     |
| 3       | 8s     |
| 4       | 16s    |
| 5       | → dead |

### Webhook payload

```json
{
  "subscription_id": "...",
  "entity_type": "account",
  "entity_id": "acc_1",
  "state_version": 5,
  "state": { ... },
  "state_hash": "abc...",
  "delivered_at": "2026-02-20T..."
}
```

### Concurrency safety

`FOR UPDATE SKIP LOCKED` ensures multiple worker instances can run in parallel without processing the same delivery. Each delivery is locked for the duration of its processing.

### Running the worker

```bash
DATABASE_URL="postgresql+psycopg://..." python3 worker/main.py
```

---

## Events query

`GET /events` returns events from the append-only log in deterministic order.

### Query parameters

| Parameter     | Type     | Default | Description                              |
|---------------|----------|---------|------------------------------------------|
| `entity_type` | string   | —       | Filter by entity type                    |
| `entity_id`   | string   | —       | Filter by entity ID                      |
| `since`       | datetime | —       | Events with `occurred_at >= since`       |
| `until`       | datetime | —       | Events with `occurred_at <= until`       |
| `limit`       | int      | 50      | Max rows returned (1-200)                |

Results are ordered by `(occurred_at ASC, ingested_at ASC, event_id ASC)`, matching the `ix_events_ordering` index for efficient scans.

---

## Time machine

`GET /state/{entity_type}/{entity_id}/at?rev=N` returns the entity state **as it was at revision N**.

### How it works

The endpoint does not store historical snapshots. Instead, it recomputes state on demand:

1. Load the current `entity_state` row to get `provenance_event_ids` (the ordered list of all state-changing event IDs)
2. Slice to the first N entries: `event_ids = provenance_event_ids[:rev]`
3. Fetch those events from the `events` table
4. Replay them through the registered reducers starting from `{}`
5. Compute `canonical_state_hash` on the resulting state
6. Return the state, hash, and provenance at that revision

This is a **read-only** operation — no rows are written. The determinism guarantee means the same revision always produces the same state and hash.

### Error cases

- `rev > state_version` returns HTTP 400
- `rev < 1` returns HTTP 422
- Entity not found returns HTTP 404

---

## Replay (delivery backfill)

`POST /replay` enqueues deliveries for a subscription across a range of historical state revisions. This is used to backfill a new subscription with past state changes, or to re-trigger failed deliveries.

### Request body

| Field             | Type   | Required | Default              | Description                  |
|-------------------|--------|----------|----------------------|------------------------------|
| `subscription_id` | string | yes      | —                    | Must be active               |
| `entity_type`     | string | no       | all types            | Filter which entities        |
| `entity_id`       | string | no       | all entities         | Filter specific entity       |
| `from_rev`        | int    | no       | 1                    | Start of version range       |
| `to_rev`          | int    | no       | current state_version| End of version range         |

### Behavior

1. Validate the subscription exists and is active (404/409 otherwise)
2. Query `entity_state` rows matching the optional filters
3. For each entity, clamp `from_rev`/`to_rev` to `[1, state_version]`
4. For each version in range, insert a delivery with the standard dedupe_key
5. Existing dedupe keys are skipped — already-delivered versions are not duplicated
6. Return `{ enqueued: N, skipped: M }`

The worker delivers the **current** entity state for replay deliveries (same as the normal flow). For "what was the state at rev N," use the time-machine endpoint separately.

### Dedupe safety

Replay uses the same `dedupe_key` format as live delivery enqueue: `{subscription_id}:{entity_type}:{entity_id}:{state_version}`. This means:

- Replaying the same range twice is safe — the second run skips all already-enqueued versions
- A subscription that already received live deliveries will skip those versions during replay

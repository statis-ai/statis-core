# Statis API (Milestone 1)

## POST /events

Ingests an append-only semantic event into Postgres with idempotency on `event_id`.

- First submission for an `event_id`: `201 Created`
- Duplicate submission for the same `event_id`: `200 OK`
- Both success responses return:

```json
{
  "accepted": true,
  "event_id": "evt_123"
}
```

Required request fields:

- `event_id`
- `entity_type`
- `entity_id`
- `event_type`
- `payload`
- `occurred_at`
- `producer`
- `schema_version`

Optional:

- `trace_id`

## Curl examples

### 1) First insert (201)

```bash
curl -i -X POST http://localhost:8000/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_1001",
    "entity_type": "account",
    "entity_id": "acc_1",
    "event_type": "ticket.updated",
    "payload": {"ticket_id": "t_1", "status": "open"},
    "occurred_at": "2026-02-19T10:00:00Z",
    "producer": "support-agent",
    "schema_version": "1"
  }'
```

### 2) Duplicate idempotent submit (200)

```bash
curl -i -X POST http://localhost:8000/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_1001",
    "entity_type": "account",
    "entity_id": "acc_1",
    "event_type": "ticket.updated",
    "payload": {"ticket_id": "t_1", "status": "open"},
    "occurred_at": "2026-02-19T10:00:00Z",
    "producer": "support-agent",
    "schema_version": "1"
  }'
```

### 3) Validation error (missing required `event_id`)

```bash
curl -i -X POST http://localhost:8000/events \
  -H "Content-Type: application/json" \
  -d '{
    "entity_type": "account",
    "entity_id": "acc_1",
    "event_type": "ticket.updated",
    "payload": {"ticket_id": "t_1"},
    "occurred_at": "2026-02-19T10:00:00Z",
    "producer": "support-agent",
    "schema_version": "1"
  }'
```

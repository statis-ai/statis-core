# CSM Demo — Step-by-Step

This guide runs the full Statis CSM scenario: **event ingestion**, **deterministic state**, and **push to receivers** (webhooks).

## Prerequisites

- Python 3.9+ with `httpx` installed (`pip install httpx`)
- Postgres running (e.g. Docker or local)
- API and worker use the same `DATABASE_URL`

## 1. Start Postgres and run migrations

```bash
# If using Docker:
docker run -d --name statis-pg -e POSTGRES_USER=statis -e POSTGRES_PASSWORD=statis \
  -e POSTGRES_DB=statis -p 5433:5432 postgres:16-alpine

# Run migrations (from repo root):
cd api && PYTHONPATH=. DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" \
  alembic upgrade head
```

## 2. Start the API

```bash
cd api
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" \
  uvicorn app.main:app --reload --port 8000
```

Leave this running. Default: `http://localhost:8000`.

## 3. (Optional) Start the webhook receiver

In a second terminal:

```bash
python examples/webhook_receiver.py --port 9999
```

You should see:

```
Webhook receiver on http://localhost:9999/ (POST)
Ctrl+C to stop.
```

To simulate retries (first 2 requests return 500, then 200):

```bash
python examples/webhook_receiver.py --port 9999 --fail-first 2
```

## 4. Run the CSM demo with push

In a third terminal (repo root):

**State-only (no subscription):**

```bash
python examples/csm_demo.py --base-url http://localhost:8000
```

**With subscription (pushes to receiver):**

```bash
python examples/csm_demo.py --base-url http://localhost:8000 --webhook-url http://localhost:9999/
```

Expected output (excerpt):

```
=== Statis CSM Demo ===
Entity: account/acc_demo_xxxxxxxx
API:    http://localhost:8000

Subscription created: <uuid>
  destination: http://localhost:9999/

--- Step 1: Support ticket opened ---
  event_type: support.ticket_updated
  POST /events -> 201
  state_version: 1
  state_hash:    abc123...
  ...

--- Step 2: Major incident reported (DB outage, high severity) ---
  ...

=== Pushes to receivers ===
Start the worker to deliver to your webhook (e.g. python worker/main.py).
Polling delivery trace a few times...

  Trace (7 deliveries): pending=7, sent=0, failed=0, dead=0
  Trace (7 deliveries): pending=5, sent=2, ...
  ...

=== Demo complete ===
```

## 5. Start the worker (so deliveries are sent)

In a fourth terminal, using the **same** `DATABASE_URL` as the API:

```bash
cd worker
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" python main.py
```

The worker polls every second. You should see logs like:

```
INFO worker: Processing delivery ...
INFO worker: Delivery ... sent 200
```

In the webhook receiver terminal you should see printed payloads:

```
[2026-02-20T...] POST #1 -> {
  "subscription_id": "...",
  "entity_type": "account",
  "entity_id": "acc_demo_...",
  "state_version": 1,
  "state": { ... },
  "state_hash": "...",
  "delivered_at": "..."
}
```

## 6. Inspect delivery trace

Replace `<subscription_id>` with the ID printed by the demo:

```bash
curl "http://localhost:8000/delivery-trace/<subscription_id>?limit=20"
```

Expected: list of deliveries with `status` (`pending` / `sent` / `failed` / `dead`), `attempt_count`, `sent_at`, `response_code`, etc.

## 7. Retrieve final state

```bash
curl http://localhost:8000/state/account/acc_demo_<suffix>
```

Use the entity ID printed at the start of the demo. Response includes `state`, `state_version`, `state_hash`, `provenance`.

## Summary

| Step | Command / action |
|------|------------------|
| 1 | Postgres + `alembic upgrade head` |
| 2 | `uvicorn app.main:app --reload` in `api/` |
| 3 | `python examples/webhook_receiver.py --port 9999` (optional) |
| 4 | `python examples/csm_demo.py --webhook-url http://localhost:9999/` |
| 5 | `python main.py` in `worker/` (same DATABASE_URL) |
| 6 | `curl .../delivery-trace/<subscription_id>` |
| 7 | `curl .../state/account/<entity_id>` |

This demonstrates **PUSH** (subscription + worker + webhook), **REPLAY** (see Milestone 4: `GET /state/.../at?rev=`, `POST /replay`), and **EXPLAINABLE STATE** (deterministic state + provenance + delivery trace).

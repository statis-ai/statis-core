# Testing the UI and Demo (All Milestones)

One place to run the **Console UI** (Account Inspector) and the **CSM demo** (events + webhook + worker) after completing the milestones.

## Prerequisites

- Python 3.9+ with deps: `cd api && pip install -r requirements.txt` (or your venv)
- `httpx` for the demo script: `pip install httpx`
- Node 18+ for the console: `cd console && npm install`
- Postgres (e.g. Docker on port 5433)

---

## Option A: Console UI only (fastest)

Good for inspecting state, timeline, diff, and deliveries for any entity.

### 1. Start Postgres and migrate

```bash
# If using Docker (once):
docker run -d --name statis-pg -e POSTGRES_USER=statis -e POSTGRES_PASSWORD=statis \
  -e POSTGRES_DB=statis -p 5433:5432 postgres:16-alpine

cd api
export DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis"
PYTHONPATH=. alembic upgrade head
```

### 2. Start the API

```bash
cd api
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" \
  uvicorn app.main:app --reload --port 8000
```

Leave running. API: **http://localhost:8000**

### 3. Start the Console

```bash
cd console
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Console: **http://localhost:3001**

### 4. Seed an entity and open the Inspector

- Run the CSM demo once to create an account (in another terminal):

  ```bash
  python examples/csm_demo.py --base-url http://localhost:8000
  ```

  Note the printed **entity_id** (e.g. `acc_demo_xxxxxxxx`).

- In the browser at **http://localhost:3001**:
  - Entity type: **account**
  - Entity ID: paste the `acc_demo_...` value from the demo output
  - Click **Inspect**

- Use the tabs:
  - **State** — current state JSON, revision, state hash, provenance
  - **Timeline** — events with payloads
  - **Diff** — compare two revisions (e.g. rev 1 vs 4)
  - **Deliveries** — only populated if you ran the demo with `--webhook-url` and the worker (see Option B)

---

## Option B: Full CSM demo (events + push + worker + webhook)

Shows event ingestion, deterministic state, subscription, worker deliveries, and webhook receiver.

### 1. Postgres + migrations

Same as Option A (steps 1–2). Keep the API running on port 8000.

### 2. (Optional) Webhook receiver

Second terminal:

```bash
python examples/webhook_receiver.py --port 9999
```

Optional retry demo: `--fail-first 2` (first 2 POSTs return 500, then 200).

### 3. Run CSM demo with push

Third terminal (repo root):

```bash
python examples/csm_demo.py --base-url http://localhost:8000 --webhook-url http://localhost:9999/
```

Note the **entity_id** and **subscription_id** in the output.

### 4. Start the worker

Fourth terminal (same `DATABASE_URL` as API):

```bash
cd worker
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" python main.py
```

Deliveries will be sent to the webhook; the receiver terminal will print payloads.

### 5. Inspect in the Console

- Open **http://localhost:3001** (with `NEXT_PUBLIC_API_URL=http://localhost:8000` if you start the console in another terminal).
- Enter the same **account** / **acc_demo_...** and click Inspect.
- **Deliveries** tab should show delivery rows (pending → sent, etc.).

### 6. Optional: delivery trace and state via API

```bash
# Replace <subscription_id> and <entity_id> from demo output
curl "http://localhost:8000/delivery-trace/<subscription_id>?limit=20"
curl "http://localhost:8000/state/account/<entity_id>"
```

---

## Automated tests

### API (pytest)

```bash
cd api
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" python -m pytest tests/ -v
```

CSM E2E (state + hash + delivery trace):

```bash
cd api
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" \
  python -m pytest tests/integration/test_csm_demo_e2e.py -v
```

### Console (Playwright)

Playwright starts the API (port 8001) and the console (port 3001) for you; ensure Postgres is running and migrated.

```bash
cd console
DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" npx playwright test
```

---

## Port summary

| Service        | Port | Used by                          |
|----------------|------|-----------------------------------|
| Postgres       | 5433 | API, worker, tests                |
| API            | 8000 | Manual run (docs / console default) |
| API (Playwright) | 8001 | Playwright `webServer`            |
| Console        | 3001 | Next.js dev                      |
| Webhook receiver | 9999 | Optional demo                    |

Use **8000** for manual API + console; Playwright uses **8001** internally.

---

## Milestone 7 (Analytics) — if implemented

- Run backfill:  
  `cd api && python -m app.analytics.backfill_daily --days 30`  
  (set `DATABASE_URL` as above if needed.)
- Query daily state:  
  `GET /analytics/account-daily?entity_id=<id>&since=&until=`
- Unit/integration tests:  
  `pytest api/tests/unit/test_daily_state.py api/tests/integration/test_analytics_backfill.py -v`

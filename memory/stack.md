# Tech Stack & Environment

Last updated: 2026-03-13

## Runtime

| Layer | Tech |
|---|---|
| Backend API | Python 3.11 · FastAPI · SQLAlchemy · Alembic · psycopg3 |
| Worker | Python daemon · `python -m worker.execute` from project root |
| Console | Next.js 15 · React 19 · Tailwind CSS · TypeScript |
| Landing | Next.js 15 · Framer Motion · Tailwind CSS |
| Python SDK | httpx · hatchling |
| TypeScript SDK | Native fetch · TypeScript 5 · CommonJS |
| DB | PostgreSQL (Neon in production) |
| Docs | Mintlify |

## Key Commands

```bash
# Tests
cd api && python -m pytest tests/unit/ -v
cd api && python -m pytest tests/integration/ -v   # needs Docker

# Migrations
cd api && DATABASE_URL=<url> python -m alembic upgrade head
cd api && DATABASE_URL=<url> python -m alembic current

# Worker
python -m worker.execute   # from project root

# API
cd api && fastapi run app/main.py

# Console
cd console && npm run dev

# Python SDK — build + publish
cd sdk && python3 -m build
TWINE_USERNAME=__token__ TWINE_PASSWORD=<pypi-token> python3 -m twine upload dist/*

# TypeScript SDK — build + publish
cd sdk-ts && npm run build
npm publish --//registry.npmjs.org/:_authToken=<npm-token>

# Node path (nvm)
export PATH="/home/aniket/.nvm/versions/node/v24.14.0/bin:$PATH"
```

## Environment Variables

| Var | Used by | Description |
|---|---|---|
| `DATABASE_URL` | API, Worker, Alembic | PostgreSQL connection string |
| `STATIS_API_KEY` | SDK, demo scripts | API key for authentication |
| `AIRFLOW_BASE_URL` | AirflowAdapter | e.g. https://airflow.internal |
| `AIRFLOW_USERNAME` | AirflowAdapter | Basic auth username |
| `AIRFLOW_PASSWORD` | AirflowAdapter | Basic auth password |
| `SALESFORCE_INSTANCE_URL` | SalesforceAdapter | e.g. https://org.my.salesforce.com |
| `SALESFORCE_ACCESS_TOKEN` | SalesforceAdapter | OAuth2 access token |
| `SALESFORCE_API_VERSION` | SalesforceAdapter | Default: v57.0 |
| `ZENDESK_SUBDOMAIN` | ZendeskAdapter | e.g. "yourcompany" |
| `ZENDESK_EMAIL` | ZendeskAdapter | Agent email |
| `ZENDESK_API_TOKEN` | ZendeskAdapter | API token |
| `HUBSPOT_ACCESS_TOKEN` | HubSpotAdapter | Private app access token (pat-...) |

## Deployment

- **Render.com:** `render.yaml`
- **Heroku:** `Procfile`
- **DB:** Neon PostgreSQL (production) — 18 migrations applied
- **PyPI:** `statis-ai@0.1.0` published
- **npm:** `statis-ai@0.1.0` published

## Key File Paths

| What | Path |
|---|---|
| API routes | `api/app/api/routes/` |
| Adapters | `api/app/adapters/` |
| Policy evaluator | `api/app/policy/evaluator.py` |
| Worker | `worker/execute.py` |
| Migrations | `api/alembic/versions/` |
| Unit tests | `api/tests/unit/` |
| Python SDK source | `sdk/src/statis/` |
| TypeScript SDK source | `sdk-ts/src/` |
| Console components | `console/src/components/` |
| Docs | `docs/` |
| Landing | `landing/src/` |

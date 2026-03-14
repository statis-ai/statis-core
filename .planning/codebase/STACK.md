# Tech Stack

## Languages
- **Python** 3.9+ — Backend API and worker processes
- **TypeScript** 5.4–5.9.3 — Frontend (Next.js) and SDKs
- **JavaScript/Node.js** 18+ — SDK and build tooling
- **SQL** — PostgreSQL schema and migrations

## Runtime & Build
- **Python**: CPython 3.9+
- **Node.js**: 18.0.0+ (SDK requirement)
- **Build tools**:
  - Hatchling (Python SDK build backend)
  - TypeScript Compiler (TSC)
  - Next.js 15–16 (React framework)
  - Tailwind CSS 3.4 (styling)
  - Autoprefixer (CSS processing)
  - PostCSS 8.4+ (CSS transformation)

## Frameworks & Core Libraries

### Backend (API & Worker)
- **FastAPI** 0.x — REST API framework
- **Uvicorn** — ASGI server
- **SQLAlchemy** — ORM for database abstraction
- **Alembic** — Database migrations
- **Pydantic** — Data validation and serialization
- **psycopg[binary]** (v3 driver) — PostgreSQL adapter
- **httpx** — Async/sync HTTP client for webhooks and external APIs

### Frontend (Console)
- **Next.js** 15.1+ — React meta-framework
- **React** 19.0+ — UI library
- **Tailwind CSS** 3.4+ — Utility-first CSS framework
- **class-variance-authority** 0.7 — Conditional CSS class composition
- **clsx** 2.1 — Utility for classname composition
- **lucide-react** 0.575+ — Icon library
- **jsondiffpatch** 0.6 — JSON diff visualization
- **tailwind-merge** 3.0 — Merge Tailwind CSS classes

### Frontend (Landing)
- **Next.js** 16.1.6 — React meta-framework (newer version)
- **React** 19.2.4 — UI library
- **Three.js** 0.183+ — 3D graphics library
- **@react-three/fiber** 9.5 — React renderer for Three.js
- **@react-three/drei** 10.7.7 — Three.js utilities
- **Framer Motion** 12.34.3 — Animation library
- **Tailwind CSS** 3.4+ — Styling
- **lucide-react** 0.575+ — Icons

### SDKs
**Python SDK (statis-ai)** — `requires-python >=3.9`
  - **httpx** >=0.24.0 — HTTP client for API communication
  - Dev: pytest, respx, pytest-asyncio

**TypeScript SDK (statis-ai)** — `engines: node >=18.0.0`
  - No runtime dependencies
  - Dev: typescript, @types/node

## Configuration
- **Environment Variables**:
  - `DATABASE_URL` — PostgreSQL connection string (defaults to `postgresql+psycopg://postgres:postgres@localhost:5432/statis`)
  - `FRONTEND_URL` — CORS allowed origins (comma-separated, defaults to localhost:3000 and localhost:3001)
  - `POLL_INTERVAL` — Worker polling interval in seconds
  - `NEXT_PUBLIC_API_URL` — Frontend API base URL
  - `NEXT_PUBLIC_API_KEY` — Frontend API key (can be read from localStorage)
  - `SALESFORCE_INSTANCE_URL`, `SALESFORCE_ACCESS_TOKEN`, `SALESFORCE_API_VERSION` — Salesforce integration
  - `HUBSPOT_ACCESS_TOKEN` — HubSpot integration
  - `ZENDESK_SUBDOMAIN`, `ZENDESK_EMAIL`, `ZENDESK_API_TOKEN` — Zendesk integration
  - `AIRFLOW_BASE_URL`, `AIRFLOW_USERNAME`, `AIRFLOW_PASSWORD` — Airflow integration

- **Configuration Files**:
  - `/api/app/config.py` — Pydantic Settings model for database URL normalization
  - `alembic.ini` — Database migration config (PostgreSQL)
  - `render.yaml` — Render.com deployment manifest with environment variable definitions

## Database
- **PostgreSQL** — Primary data store
- **Connection**: SQLAlchemy with psycopg (v3) driver
- **Migrations**: Alembic (19 migrations total)
- **Tables** (12 core):
  - events, entity_state, subscriptions, deliveries, api_keys, quarantine
  - action_contracts, policy_rules, receipts, execution_locks
  - escalation_reviews, users

## Testing
- **Python**: pytest, testcontainers[postgres]
- **TypeScript/Frontend**: Playwright e2e testing, Node.js test runner
- **Test coverage**: 26+ tests across units and integration

## Deployment
- **Render.com**: YAML-based service configuration (render.yaml)
- **Heroku**: Procfile support
- **Process types**: web (FastAPI/Uvicorn) and worker (webhook delivery + execution)
- **Language runtimes**: Python runtime specified in render.yaml

## DevTools & Linting
- **Python**: None specified (basic structure)
- **TypeScript**:
  - ESLint 9.16+
  - eslint-config-next for Next.js rules
- **Type checking**: TypeScript strict mode enabled across all projects

## Package Management
- Python: pip (requirements.txt in api/)
- Node.js: npm (package.json in console/, landing/, sdk-ts/)

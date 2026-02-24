# Statis Platform

Statis is a multi-tenant, event-driven platform and developer console designed for reliable entity state tracking and webhook deliveries.

## System Architecture

The repository is organized into three primary services:
- **`/api`**: A FastAPI backend service that manages multi-tenant event ingestion, state aggregation, subscription definitions, and Developer Admin functions (like API key generation).
- **`/console`**: A Next.js frontend Developer Console that provides an Account Inspector interface for developers to debug entity lifecycles, view timelines, and manage their tenant API keys securely.
- **`/worker`**: A Python-based delivery worker daemon that persistently polls for pending webhook deliveries and securely broadcasts them with exponential backoff guarantees.

## Getting Started Locally

To run the full end-to-end platform locally:

1. **Database Setup**
   Ensure PostgreSQL is running locally and set your `DATABASE_URL` environment variable.
   ```bash
   cd api
   alembic upgrade head
   ```

2. **Backend API**
   Start the FastAPI server.
   ```bash
   cd api
   fastapi run app/main.py
   ```

3. **Developer Console**
   Start the Next.js frontend.
   ```bash
   cd console
   npm run dev
   ```

4. **Delivery Worker**
   Run the background worker to dispatch webhooks.
   ```bash
   cd worker
   python deliver.py
   ```

## Cloud Deployment (Railway / Vercel)

The codebase is pre-configured and optimized for seamless deployment workflows using Nixpacks or Docker-based environments out of the box.

If you are starting a fresh database instance in the cloud, make sure to execute the `seed_admin.py` bootstrap script via your environment command palette to generate your first isolated master tenant API key:
```bash
python api/scripts/seed_admin.py
```

## License
MIT License

# Deploy Basal to Neon + Render + Vercel

This guide deploys the full stack: **Neon** (Postgres), **Render** (API + Worker), and **Vercel** (Console + Landing).

## Architecture

| Component | Path | Runtime | Host | Key env |
|-----------|------|---------|------|---------|
| Database | — | Postgres | Neon | — |
| API | `api/` | FastAPI (Python) | Render | `DATABASE_URL`, `FRONTEND_URL`, `PORT` |
| Worker | `worker/` | Python | Render | `DATABASE_URL`, `POLL_INTERVAL` (optional) |
| Console | `console/` | Next.js 15 | Vercel | `NEXT_PUBLIC_API_URL` |
| Landing | `landing/` | Next.js 16 | Vercel | (none) |

- Console and Landing are hosted on **Vercel** (two separate projects, same repo, different root).
- API and Worker run on **Render**; both connect to **Neon** Postgres over the public internet with SSL.

---

## 1. Neon (Postgres)

### 1.1 Create a project

1. Sign up / log in at [neon.tech](https://neon.tech).
2. **Create Project** — pick a region close to your Render services (e.g. `us-east-1`).
3. Name the database `statis` (or accept the default `neondb`).
4. Copy the **connection string** from the dashboard. It looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/statis?sslmode=require
   ```

### 1.2 Connection strings

Neon provides two endpoints:

| Endpoint | Port | Use for |
|----------|------|---------|
| Direct | 5432 | Worker (long-lived polling connection) |
| Pooled (PgBouncer) | default when copied | API (many short-lived connections) |

You can use the same connection string for both services to start. If you want to optimize, use the pooled URL for the API and the direct URL (add `-pooler` removal or check Neon dashboard) for the Worker.

### 1.3 Run migrations

Neon URLs are publicly reachable, so you can run migrations from your local machine:

```bash
cd api
DATABASE_URL='postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/statis?sslmode=require' \
  alembic upgrade head
```

Or use the helper script:

```bash
DATABASE_URL='<your-neon-url>' ./api/scripts/run_migrations.sh
```

### 1.4 Seed admin key (first time)

```bash
cd api
DATABASE_URL='<your-neon-url>' python scripts/seed_admin.py
```

---

## 2. Render (API + Worker)

You can deploy using the **Blueprint** (`render.yaml` at repo root) or manually.

### Option A — Blueprint (recommended)

1. In Render: **New** → **Blueprint** → connect this GitHub repo.
2. Render detects `render.yaml` and creates both services (`statis-api` web + `statis-worker` background worker).
3. Set environment variables for each service (see below).
4. Deploy.

### Option B — Manual setup

#### 2.1 API service

- **New Web Service** → connect this repo.
- **Root Directory:** `api`.
- **Runtime:** Python.
- **Build Command:** `pip install -r requirements.txt`.
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (or `./start.sh`).
- **Environment Variables:**
  - `DATABASE_URL` — your Neon connection string.
  - `FRONTEND_URL` — your Vercel Console URL, e.g. `https://your-console.vercel.app`. For multiple origins, use a comma-separated list (no spaces): `https://console-xxx.vercel.app,https://landing-xxx.vercel.app`.
- Note the public URL (e.g. `https://statis-api.onrender.com`).

#### 2.2 Worker service

- **New Background Worker** → same repo.
- **Root Directory:** leave empty (repo root) so both `api/` and `worker/` are available.
- **Runtime:** Python.
- **Build Command:** `pip install -r api/requirements.txt`.
- **Start Command:** `PYTHONPATH=api python worker/main.py`.
- **Environment Variables:**
  - `DATABASE_URL` — same Neon connection string as API.
  - `POLL_INTERVAL` — optional (default `1` second).
- No public URL needed; this is a background worker.

---

## 3. Vercel (Console + Landing)

Use **two Vercel projects**, both connected to the same GitHub repo, with different **Root Directory**.

### 3.1 Console app

- **New Project** → Import this repo.
- **Root Directory:** `console`.
- **Framework Preset:** Next.js.
- **Build Command:** `npm run build` (default).
- **Environment variables:**
  - `NEXT_PUBLIC_API_URL` = `https://statis-api.onrender.com` (your Render API URL, no trailing slash).
  - Optional: `NEXT_PUBLIC_API_KEY` if you use API key auth in the Console.
- Deploy and note the URL (e.g. `https://console-xxx.vercel.app`). Set this as `FRONTEND_URL` in the Render API service (see 2.1).

### 3.2 Landing app

- **New Project** → same repo.
- **Root Directory:** `landing`.
- **Framework Preset:** Next.js.
- **Build Command:** `npm run build`.
- No API env vars needed unless you add features that call the API.

---

## 4. Wiring and checks

1. **CORS:** Set Render API `FRONTEND_URL` to your Vercel Console URL (and optionally a comma-separated list including the Landing URL if it will call the API). Redeploy the API after changing env vars.
2. **Console → API:** Set Vercel (Console) `NEXT_PUBLIC_API_URL` to the Render API public URL. Redeploy the Console after changing env vars.
3. **Health:** Open `https://<api-url>/health` in a browser; then open the Console app and confirm it can reach the API.
4. **Worker:** In Render logs for the Worker service, confirm "Delivery worker starting" and no database connection errors.
5. **Signup failed troubleshooting:** (a) Verify `FRONTEND_URL` on Render matches the exact Console origin (no trailing slash). (b) Verify `NEXT_PUBLIC_API_URL` on Vercel matches the Render API URL (no trailing slash). Check DevTools → Network for the failed request.

---

## 5. Order of operations

1. Create Neon project; note the connection string.
2. Run migrations locally against Neon (`alembic upgrade head`).
3. Seed admin key (`python scripts/seed_admin.py`).
4. Deploy API on Render (env: `DATABASE_URL`, `FRONTEND_URL` placeholder); note the public URL.
5. Deploy Worker on Render (env: `DATABASE_URL`).
6. Create Vercel project for Console (env: `NEXT_PUBLIC_API_URL` = Render API URL); deploy.
7. Update Render API `FRONTEND_URL` to the Vercel Console URL; redeploy API.
8. Create Vercel project for Landing; deploy.

---

## 6. Repo reference

- **Render Blueprint:** [render.yaml](../render.yaml) — defines API + Worker services.
- **API start:** [api/Procfile](../api/Procfile) and [api/start.sh](../api/start.sh) — both use `$PORT`.
- **Worker start:** Always from repo root: `PYTHONPATH=api python worker/main.py`.
- **Migrations:** [api/scripts/run_migrations.sh](../api/scripts/run_migrations.sh) — run locally with `DATABASE_URL` set.
- **CORS:** [api/app/main.py](../api/app/main.py) reads `FRONTEND_URL`; supports a single URL or comma-separated list.

---

## 7. Cold starts (free tiers)

Both Neon and Render free tiers have cold-start behavior:

- **Neon:** Compute sleeps after 5 minutes of inactivity. First query after sleep takes ~500ms. Paid plans can keep compute always-on.
- **Render:** Free web services spin down after 15 minutes of inactivity. First request after spin-down takes several seconds. Paid plans ($7/mo) keep services running.

For production use, upgrade both to paid tiers to avoid cold starts.

---

## 8. Docs (Mintlify)

Docs are hosted on **Mintlify** (repo `docs/` with `mint.json`, MDX, OpenAPI). The live site is at your Mintlify URL (e.g. `https://<subdomain>.mintlify.app`).

**Optional — serve docs at `/docs` on your Landing:**

1. **Vercel (Landing):** The repo has [landing/vercel.json](../landing/vercel.json) with rewrites to Mintlify. If your Mintlify subdomain differs from `statis`, edit `landing/vercel.json` and replace `statis` with your subdomain. Deploy the Landing app.
2. **Mintlify dashboard:** Go to [dashboard.mintlify.com](https://dashboard.mintlify.com) → Settings → Custom domain. Add your Landing domain and turn **Host at `/docs`** on.
3. Redeploy Landing if you changed `vercel.json`. Docs will be at `https://<landing-domain>/docs`.

# Deploy Basal to Railway and Vercel

This guide deploys the full stack: **Railway** (Postgres, API, Worker) and **Vercel** (Console + Landing).

## Architecture

| Component | Path | Runtime | Key env |
|-----------|------|---------|---------|
| API | `api/` | FastAPI (Python) | `DATABASE_URL`, `FRONTEND_URL`, `PORT` |
| Worker | `worker/` | Python | `DATABASE_URL`, `POLL_INTERVAL` (optional) |
| Console | `console/` | Next.js 15 | `NEXT_PUBLIC_API_URL` |
| Landing | `landing/` | Next.js 16 | (none) |

- Console and Landing are hosted on **Vercel** (two separate projects, same repo, different root).
- API and Worker share **Postgres** on **Railway**; Console calls the API over HTTPS.

---

## 1. Railway (Postgres + API + Worker)

Use one Railway project with three services.

### 1.1 Postgres

- In Railway: **New** → **Database** → **Postgres** (or add Postgres from the catalog).
- Copy **`DATABASE_URL`** (or `POSTGRES_URL`) from the Postgres service variables. You will reference it in the API and Worker services.

### 1.2 API service

- **New Service** → deploy from **GitHub** → select this repo.
- **Root Directory:** `api`.
- **Build:** Railway detects Python and runs `pip install -r requirements.txt` from the `api` root. No extra config needed.
- **Start:** Railway will use the **Procfile** in `api/` if present:
  - `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Or set **Custom Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (or `./start.sh` if you prefer the script).
- **Variables:**
  - `DATABASE_URL` — reference the Postgres service variable (or paste the URL).
  - `FRONTEND_URL` — your Vercel Console URL, e.g. `https://your-console.vercel.app`. For multiple origins (e.g. Console + Landing), use a **comma-separated list** (no spaces): `https://console-xxx.vercel.app,https://landing-xxx.vercel.app`. Used for CORS in `api/app/main.py`.
- **Settings:** Generate a **public domain** (e.g. `api-xxx.up.railway.app`) and note the URL for the Console.

### 1.3 Worker service

- **New Service** → same repo.
- **Root Directory:** leave **empty** (repo root) so both `api/` and `worker/` are available.
- **Build:** Install API dependencies so the worker can import `app`:
  - Build command: `pip install -r api/requirements.txt`
- **Start Command:** `PYTHONPATH=api python worker/main.py` (run from **repo root**). Do not run from `worker/` only; the worker imports from `api/app`.
- **Why root `requirements.txt` and `nixpacks.toml`:** The repo has `console/` and `landing/` with `package.json`, so Nixpacks can pick a Node image and then `pip` is missing. The root [`requirements.txt`](../requirements.txt) and [`nixpacks.toml`](../nixpacks.toml) force a Python build image for this service. You can ignore the “Script start.sh not found” warning (start is the custom command above).
- **Variables:**
  - `DATABASE_URL` — same as API (reference Postgres).
  - `POLL_INTERVAL` — optional (default `1` second).
- No public domain needed. In Railway, configure this service as a **Background Worker** (or equivalent) so it is not treated as a web service.

### 1.4 Migrations

Run Alembic once after the API is deployed (and whenever you add new migrations):

- **Option A — Railway CLI:** From the API service context (root `api`):
  ```bash
  railway run -s <api-service-name> -- alembic upgrade head
  ```
  (Run this from a shell where `railway` is linked to your project and you have selected the API service.)

- **Option B — One-off job:** In Railway, add a one-off job or run from the API service shell with working directory `api`: `alembic upgrade head`.

- **Option C — Build step:** In the API service build settings, add a step after `pip install`: `alembic upgrade head`. Some teams prefer running migrations manually or from CI instead.

---

## 2. Vercel (Console + Landing)

Use **two Vercel projects**, both connected to the same GitHub repo, with different **Root Directory**.

### 2.1 Console app

- **New Project** → Import this repo.
- **Root Directory:** `console`.
- **Framework Preset:** Next.js.
- **Build Command:** `npm run build` (default).
- **Environment variables:**
  - `NEXT_PUBLIC_API_URL` = `https://<api-public-url>.up.railway.app` (no trailing slash).
  - Optional: `NEXT_PUBLIC_API_KEY` if you use API key auth in the Console.
- Deploy and note the URL (e.g. `https://console-xxx.vercel.app`). Set this as `FRONTEND_URL` in the Railway API (see 1.2).

### 2.2 Landing app

- **New Project** → same repo.
- **Root Directory:** `landing`.
- **Framework Preset:** Next.js.
- **Build Command:** `npm run build`.
- No API env vars needed unless you add features that call the API.

---

## 3. Wiring and checks

1. **CORS:** Set Railway API `FRONTEND_URL` to your Vercel Console URL (and optionally a comma-separated list including the Landing URL if it will call the API).
2. **Console → API:** Set Vercel (Console) `NEXT_PUBLIC_API_URL` to the Railway API public URL. Redeploy the Console after changing env vars.
3. **Health:** Open `https://<api-url>/health` in a browser; then open the Console app and confirm it can reach the API (e.g. Inspect or health check).
4. **Worker:** In Railway logs for the Worker service, confirm “Delivery worker starting” and no database connection errors.

---

## 4. Order of operations

1. Create Railway project; add Postgres; note `DATABASE_URL`.
2. Deploy API service (root `api`, env: `DATABASE_URL`, `FRONTEND_URL` placeholder); get public URL.
3. Run migrations (one-off from API context).
4. Deploy Worker (root repo, start: `PYTHONPATH=api python worker/main.py`, same `DATABASE_URL`).
5. Create Vercel project for Console (root `console`); set `NEXT_PUBLIC_API_URL` to Railway API URL; deploy.
6. Update Railway API `FRONTEND_URL` to the Vercel Console URL; redeploy API if needed.
7. Create Vercel project for Landing (root `landing`); deploy.

---

## 5. Repo reference

- **API start:** [api/Procfile](api/Procfile) and [api/start.sh](api/start.sh) — both use `$PORT` (or `PORT` env) for Railway.
- **Worker start:** Always from **repo root**: `PYTHONPATH=api python worker/main.py`.
- **CORS:** [api/app/main.py](api/app/main.py) reads `FRONTEND_URL`; supports a single URL or comma-separated list.

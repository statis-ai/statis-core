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
- **Why root `requirements.txt` and `nixpacks.toml`:** The repo has `console/` and `landing/` with `package.json`, so Nixpacks can pick a Node image and then `pip` is missing. The root [`requirements.txt`](../requirements.txt) and [`nixpacks.toml`](../nixpacks.toml) force a Python build image. The root `requirements.txt` lists the same packages as `api/requirements.txt` (keep in sync) so the default install step works before `api/` is available. You can ignore the “Script start.sh not found” warning (start is the custom command above).
- **Variables:**
  - `DATABASE_URL` — same as API (reference Postgres).
  - `POLL_INTERVAL` — optional (default `1` second).
- No public domain needed. In Railway, configure this service as a **Background Worker** (or equivalent) so it is not treated as a web service.

### 1.4 Migrations

Run Alembic once after the API is deployed (and whenever you add new migrations). Migrations must run **inside Railway** (or with a public DB URL), because `DATABASE_URL` uses the internal host `postgres.railway.internal`, which only resolves from Railway’s network.

**Option A — Shell / one-off (recommended):**

1. In Railway, open the **API** service (the one with Root Directory `api`).
2. Open **Shell** (or **Run command** / one-off) for that service.
3. Run (no `cd` needed if root is `api`):
   ```bash
   alembic upgrade head
   ```
   If the shell starts at repo root, run: `cd api && alembic upgrade head`.

**Option B — Pre-deploy step:**

1. In the API service → **Settings** → **Deploy** → **Add pre-deploy step**.
2. Set the command to: `alembic upgrade head`.
3. Save. The next deploy will run migrations before starting the app. Remove the step later if you prefer to run migrations manually.

**Option C — Railway CLI (only with public DB URL):**

`railway run` runs the command **on your machine**; the injected `DATABASE_URL` uses `postgres.railway.internal`, which does not resolve locally, so migrations will fail unless you use a **public** database URL.

- To use the CLI: In Railway, open the **Postgres** service and copy the **public** connection URL (e.g. from Variables or Connect). In a terminal: `cd api`, then `export DATABASE_URL='<public-url>'`, then `alembic upgrade head`. Do not commit the public URL.
- Optional script (still needs a resolvable `DATABASE_URL`): `./api/scripts/run_migrations_railway.sh <api-service-name>`.

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
5. **Signup failed:** (a) **CORS:** Set Railway API `FRONTEND_URL` to the **exact** Console origin (from the browser address bar, e.g. `https://statis-console.vercel.app` — no trailing slash). (b) Set Vercel Console `NEXT_PUBLIC_API_URL` to the Railway API URL (no trailing slash). Redeploy the API after changing `FRONTEND_URL`; redeploy the Console after changing env vars. If the error message shows an origin, use that value in `FRONTEND_URL`. Check DevTools → Network for the failed request (status 0 or CORS = origin not allowed).

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

---

## 6. Docs (Mintlify)

Docs are already hosted on **Mintlify** (repo **`docs/`** with `mint.json`, MDX, OpenAPI). The live site is at your Mintlify URL (e.g. `https://<subdomain>.mintlify.app`).

**Optional — serve docs at `/docs` on your Landing (e.g. yoursite.com/docs):**

1. **Vercel (Landing):** The repo has [landing/vercel.json](landing/vercel.json) with rewrites to Mintlify. It uses `statis.mintlify.app` — if your Mintlify subdomain is different, edit `landing/vercel.json` and replace `statis` with your subdomain in both `destination` URLs. Deploy the Landing app (or push and let Vercel redeploy).
2. **Mintlify dashboard:** Go to [dashboard.mintlify.com](https://dashboard.mintlify.com) → your docs project → **Settings** → **Custom domain**. Add your Landing domain (e.g. `your-app.vercel.app` or your custom domain). Turn **Host at `/docs`** on (so Mintlify serves at `/docs` when requested via your domain).
3. **Redeploy Landing** if you changed `vercel.json`. Docs will be at `https://<landing-domain>/docs`.

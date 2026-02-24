# Milestone 5 — Console UI (Account Inspector) — Completed

**Completed:** 2026-02-19

## Summary

Built a standalone Next.js console app (`console/`) providing an Account Inspector UI with four tabs for end-to-end entity debugging, backed by the existing Statis API.

## What Was Implemented

### API Changes
- **CORS middleware** added to `api/app/main.py` allowing console origins (localhost:3000, localhost:3001)
- **New `GET /deliveries` endpoint** in `api/app/api/routes/deliveries.py` — entity-scoped delivery query (`entity_type` + `entity_id` params) since the existing `/delivery-trace/{subscription_id}` was subscription-scoped
- **Fixed Alembic `env.py`** to prioritize `DATABASE_URL` environment variable over `alembic.ini` default

### Console App (`console/`)
- **Tech stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, jsondiffpatch
- **Entity Lookup:** dropdown for entity_type (defaults to `account`), text input for entity_id, Inspect button
- **State Tab:** current state JSON (syntax-highlighted), revision number, state hash, last event ID, provenance event list
- **Timeline Tab:** chronological event list with expandable JSON payloads, showing event_id, event_type, occurred_at, producer
- **Diff Tab:** compare two revisions client-side — fetches state at each revision via `/state/{type}/{id}/at?rev=`, computes delta with `jsondiffpatch`, renders HTML diff with added/removed highlighting
- **Deliveries Tab:** entity-scoped delivery table showing subscription_id, version, status (color-coded), attempt count, sent time, last error

### Tests
- **Playwright smoke tests** (2 tests):
  1. Load inspector, seed entity via API, verify State tab renders JSON
  2. Switch to Timeline tab, verify event count displays
- **API unit tests** — all 63 existing tests continue to pass

## Files Added/Modified

### New Files
| File | Purpose |
|------|---------|
| `console/package.json` | Next.js project config |
| `console/next.config.ts` | Next.js configuration |
| `console/tsconfig.json` | TypeScript config |
| `console/tailwind.config.ts` | Tailwind with Statis brand colors |
| `console/postcss.config.mjs` | PostCSS config |
| `console/playwright.config.ts` | Playwright test config (starts API + console) |
| `console/src/app/layout.tsx` | Root layout with dark theme |
| `console/src/app/page.tsx` | Main inspector page with tab navigation |
| `console/src/app/globals.css` | Global Tailwind styles |
| `console/src/app/jsondiffpatch.css` | Dark-adapted diff formatter styles |
| `console/src/lib/api.ts` | Typed API client (fetchState, fetchStateAtRev, fetchEvents, fetchDeliveries) |
| `console/src/lib/utils.ts` | Tailwind `cn()` utility |
| `console/src/components/entity-lookup.tsx` | Entity type/ID lookup form |
| `console/src/components/tabs/state-tab.tsx` | State viewer with metadata chips |
| `console/src/components/tabs/timeline-tab.tsx` | Event timeline with expandable rows |
| `console/src/components/tabs/diff-tab.tsx` | Revision diff with jsondiffpatch |
| `console/src/components/tabs/deliveries-tab.tsx` | Delivery trace table |
| `console/tests/inspector.spec.ts` | Playwright smoke tests |

### Modified Files
| File | Change |
|------|--------|
| `api/app/main.py` | Added CORS middleware |
| `api/app/api/routes/deliveries.py` | Added `GET /deliveries` entity-scoped endpoint |
| `api/alembic/env.py` | Fixed DATABASE_URL env var priority |

## Acceptance Criteria

- [x] Can look up any entity by type + ID
- [x] All four tabs render real data from the API
- [x] Playwright smoke tests pass (2/2)
- [x] End-to-end entity debugging achievable in under 2 minutes locally

## How to Run

```bash
# Terminal 1: Start Postgres (if not running)
docker run -d --name statis-pg -e POSTGRES_USER=statis -e POSTGRES_PASSWORD=statis \
  -e POSTGRES_DB=statis -p 5433:5432 postgres:16-alpine

# Run migrations
cd api && PYTHONPATH=. DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" \
  alembic upgrade head

# Terminal 2: Start API
cd api && DATABASE_URL="postgresql+psycopg://statis:statis@localhost:5433/statis" \
  uvicorn app.main:app --port 8001

# Terminal 3: Start Console
cd console && NEXT_PUBLIC_API_URL=http://localhost:8001 npm run dev

# Open http://localhost:3001 in browser
```

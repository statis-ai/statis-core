# Claude Instructions — Statis Core

## Session Protocol

**At the start of every session**, read the following memory files to restore full context:

```
memory/project.md      — current build state, what's done, what's in flight
memory/decisions.md    — architectural and product decisions + rationale
memory/preferences.md  — how the user likes to work, code style, workflow preferences
memory/user.md         — who Aniket is, his background, goals
memory/stack.md        — tech stack, env vars, deployment targets, credentials shape
memory/people.md       — team, collaborators, external contacts (if any)
```

**At the end of every session** (or when significant work is done), update any files that changed. Add new entries; don't delete old ones unless explicitly told to.

---

## Standing Rules

- **Never add Claude as co-author in git commits.** Do not add `Co-Authored-By: Claude` lines. Ever.
- Always update `STATUS.md` when a feature ships, a migration runs, or a section changes.
- Prefer editing existing files over creating new ones.
- No emojis unless explicitly asked.
- Keep responses short and direct. No filler, no summaries of what was just done.
- When referencing files or code, use markdown links with line numbers.

---

## Project Overview

Statis is agent execution infrastructure — the layer between AI agents and production systems.

**Repo:** `/home/aniket/statis/statis-core`
**Primary working dirs:** `api/`, `worker/`, `console/`, `sdk/` (Python), `sdk-ts/` (TypeScript), `landing/`, `docs/`

**Run tests:** `cd api && python -m pytest tests/unit/ -v`
**Run migrations:** `cd api && DATABASE_URL=<url> python -m alembic upgrade head`
**DB:** Neon PostgreSQL (connection string in session — not stored here)

See `STATUS.md` for full build state.

**Ops repo (cross-workstream context):** `/home/aniket/statis/statis-ops`
At session start, also read `statis-ops/SYNC.md` for signals from other workstreams (landing, accelerator, marketing, security).

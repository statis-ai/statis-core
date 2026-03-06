# Statis — Build Status

> **Keep this file current.** Update it whenever a feature ships, a section changes, or a milestone closes.
>
> Last updated: 2026-03-06

---

## What Statis Is

Agent execution infrastructure. The layer between AI agents and production systems.

**Core promise:** Shared state in. Governed, receipted action out.

**Four primitives:**
1. **Action Contract** — Agents propose before they execute
2. **Policy Engine** — Deterministic rules evaluate proposals
3. **Execution Guarantee** — Distributed lock ensures exactly-once execution
4. **Ledger (Receipt)** — SHA-256 tamper-evident receipt written at execution

---

## Backend — `api/`

### Status: ✅ Complete (Milestones 1–6, 8–9)

| Feature | Status | Key Files |
|---|---|---|
| Append-only event log (idempotent, deterministic ordering) | ✅ | `api/app/repositories/events.py` |
| State materialization (9 reducers, SHA-256 hashing, optimistic concurrency) | ✅ | `api/app/reducers/` |
| Push delivery (webhook subscriptions, dedup, exponential backoff, SKIP LOCKED) | ✅ | `worker/` |
| Time-travel queries (`GET /state/.../at?rev=N`) | ✅ | `api/app/api/routes/` |
| Multi-tenancy + RBAC-lite (role filtering + state field redaction) | ✅ | `api/app/rbac.py` |
| Poison-pill quarantine (3 failures → quarantine entity) | ✅ | `api/app/models/quarantine.py` |
| Action Contract (P1) | ✅ | `api/app/models/action_contract.py`, `POST /actions` |
| Policy Engine (P2) | ✅ | `api/app/policy/evaluator.py`, `POST /actions/{id}/evaluate` |
| Execution Guarantee (P3) | ✅ | `api/app/models/execution_lock.py`, `worker/execute.py` |
| Ledger / Receipt (P4) | ✅ | `api/app/models/receipt.py`, `GET /receipts/{action_id}` |

### DB Schema (12 migrations)
`events`, `entity_state`, `subscriptions`, `deliveries`, `api_keys`, `quarantine`, `action_contracts`, `policy_rules`, `receipts`, `execution_locks`

### Tests
- **112 unit tests** (`api/tests/unit/`)
- **16 integration tests** using `testcontainers[postgres]`
- Notable: `test_policy_evaluator.py` (10 pure unit, no DB), `test_receipt_hash.py` (8 hash property tests)

### Key Bug Fixes
- **psycopg3 `rowcount` bug** — `INSERT ... ON CONFLICT DO NOTHING` returns unreliable rowcount with psycopg3. Fixed in `worker/execute.py` `_try_acquire_lock` using `.returning(ExecutionLock.action_id)` + `fetchone() is not None`

---

## Worker — `worker/`

### Status: ✅ Complete

- `worker/execute.py` — execution worker; polls `APPROVED` actions, acquires lock, calls adapter, writes receipt
- `worker/__init__.py` — package entrypoint; run with `python -m worker.execute`
- Three-transaction pattern: T1 (acquire lock + EXECUTING) → T2 (adapter call) → T3 (receipt + COMPLETED/FAILED + release)
- ADAPTERS registry: `{"stripe": MockStripeAdapter()}`
- `api/app/adapters/stripe_mock.py` — `MockStripeAdapter` handles `retention_offer` + `apply_discount` (50ms fake latency)

---

## Console UI — `console/`

### Status: ✅ Complete

Next.js 15 Account Inspector with 5 tabs:
- **State** — current materialized entity state
- **Timeline** — event log
- **Diff** — state changes between revisions
- **Deliveries** — webhook delivery status
- **Developers** — API keys, subscriptions

---

## Landing Page — `landing/`

### Status: ✅ Complete (light theme, on `feature/landing-light-theme-redesign`)

**Tech:** Next.js 15 / React 19 / Tailwind CSS / Framer Motion

**Page structure (in order):**

| Section | Component | Description |
|---|---|---|
| Navbar | `NavbarV2` | Logo (`logomark-transparent.png`) + nav links incl. Primitives |
| Hero | `HeroV2` | Particle network BG, badge, H1 with gradient span, pill chain, CTAs |
| The Problem | `BentoFeaturesSection` | Two-card grid: Read Problem + Write Problem with incident logs |
| Bridge | `ProblemBridgeSection` | Kinetic zoom animation: "You wouldn't deploy code without CI/CD. You shouldn't deploy agents without Statis." |
| The Solution | `IntroducingStatisSection` | 5-step bento grid (dark bg) — State → Propose → Evaluate → Execute → Receipt |
| Core Primitives | `BeforeAfterSection` | 2×2 grid of P1–P4 with pastel cards and code detail blocks |
| Demo Scenario | `UseCasesSection` | Split layout: entity state + rule panels (light) + dark terminal |
| Architecture | `AIStackSection` | 3-row stack: Agents ↕ Statis (highlighted) ↕ Production |
| The Distinction | `MemoryVsRealitySection` | "Not X" cards + Memory vs Reality / Logs vs Receipts comparisons |
| FAQ + CTA | `FAQSection` | Animated accordion FAQ (light) + dark CTA block |
| Footer | `FooterV2` | Logo, tagline, GitHub link |

**Theme:**
- White/gray-50 backgrounds throughout
- `text-gradient` utility: `indigo-600 → violet-600` applied to all H2 section headers
- Accent labels at `-600` saturation for light bg contrast
- Terminal in Demo section kept dark (intentional)
- CTA block at bottom kept dark (intentional contrast)

**Public assets:** `landing/public/` — logomark variants, og-banner, twitter-card, favicons, brand-sheet, hero-visual

---

## Demo Script — `examples/`

### Status: ✅ Complete

`examples/retention_demo.py` — full end-to-end demo
- Entity: `acct-42`, fresh `action_id` each run (timestamp suffix)
- Posts `account.churn_risk_updated { churn_risk: true }`
- Starts execution worker in background thread
- Polls `GET /actions/{id}` every 500ms until `COMPLETED`
- Step 6 proves idempotency: 409 on duplicate propose + 409 on re-evaluate
- Run: `STATIS_API_KEY=<key> python examples/retention_demo.py`

---

## Deployment

| Target | Config |
|---|---|
| Render.com | `render.yaml` |
| Heroku | `Procfile` |
| Environment | `DATABASE_URL` env var |

---

## Branches

| Branch | Status | Notes |
|---|---|---|
| `main` | Stable | Backend + 4 primitives + Console UI |
| `feature/landing-light-theme-redesign` | Active | Full landing page redesign |

---

## What's Next (not yet built)

- [ ] Real adapter integrations (Salesforce, Zendesk, HubSpot)
- [ ] VPC / self-hosted deployment option
- [ ] SDK (Python, TypeScript) for agent integration
- [ ] Console: Action Contract viewer + Receipt viewer tabs
- [ ] Escalation flow (ESCALATED → human approval → resume)
- [ ] Multi-policy support (multiple rules per action type)
- [ ] Landing: Blog section
- [ ] Landing: Docs site

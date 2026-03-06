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

### Status: ✅ Complete (Milestones 1–6, 8–9 + Console API)

| Feature | Status | Key Files |
|---|---|---|
| Append-only event log (idempotent, deterministic ordering) | ✅ | `api/app/repositories/events.py` |
| State materialization (9 reducers, SHA-256 hashing, optimistic concurrency) | ✅ | `api/app/reducers/` |
| Push delivery (webhook subscriptions, dedup, exponential backoff, SKIP LOCKED) | ✅ | `worker/` |
| Time-travel queries (`GET /state/.../at?rev=N`) | ✅ | `api/app/api/routes/` |
| Multi-tenancy + RBAC-lite (role filtering + state field redaction) | ✅ | `api/app/rbac.py` |
| Poison-pill quarantine (3 failures → quarantine entity) | ✅ | `api/app/models/quarantine.py` |
| Action Contract (P1) | ✅ | `api/app/models/action_contract.py`, `POST /actions` |
| List actions by entity (`GET /actions?entity_type=&entity_id=`) | ✅ | `api/app/api/routes/actions.py` |
| Policy Engine (P2) | ✅ | `api/app/policy/evaluator.py`, `POST /actions/{id}/evaluate` |
| Conditions evaluated stored on receipt | ✅ | `receipts.conditions_evaluated` JSONB |
| Entity state snapshot stored on receipt | ✅ | `receipts.entity_state_snapshot` JSONB |
| Execution Guarantee (P3) | ✅ | `api/app/models/execution_lock.py`, `worker/execute.py` |
| Ledger / Receipt (P4) | ✅ | `api/app/models/receipt.py`, `GET /receipts/{action_id}` |

### DB Schema (13 migrations)
`events`, `entity_state`, `subscriptions`, `deliveries`, `api_keys`, `quarantine`, `action_contracts`, `policy_rules`, `receipts` (+ `conditions_evaluated`, `entity_state_snapshot`), `execution_locks`

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

### Status: ✅ Complete (7 tabs)

Next.js 15 Account Inspector:

| Tab | Description |
|---|---|
| **State** | Current materialized entity state + provenance |
| **Timeline** | Full event log, expandable payload per event |
| **Diff** | State changes between revisions |
| **Deliveries** | Webhook delivery status, attempts, errors |
| **Actions** | All action contracts for entity — status lifecycle, clickable rows |
| **Receipt** | Selected action's tamper-evident receipt — decision, rule, conditions evaluated with pass/fail, entity state snapshot, execution result, SHA-256 hash with copy button |
| **Developers** | API keys, subscriptions |

**Flow:** Actions tab → click a row → auto-navigates to Receipt tab (dot indicator shows active selection)

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
| The Solution | `IntroducingStatisSection` | 5-step bento grid — State → Propose → Evaluate → Execute → Receipt |
| Core Primitives | `BeforeAfterSection` | 2×2 grid of P1–P4 with pastel cards and code detail blocks |
| Demo Scenario | `UseCasesSection` | Split layout: entity state + rule panels (light) + dark terminal |
| Architecture | `AIStackSection` | 3-row stack: Agents ↕ Statis (highlighted) ↕ Production |
| The Distinction | `MemoryVsRealitySection` | "Not X" cards + Memory vs Reality / Logs vs Receipts comparisons |
| FAQ + CTA | `FAQSection` | Animated accordion FAQ (light) + dark CTA block |
| Footer | `FooterV2` | Logo, tagline, GitHub link |

**Theme:** White/gray-50 backgrounds, `text-gradient` (indigo-600 → violet-600) on all H2 headers

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
| `main` | Stable | Backend + 4 primitives + Console UI (7 tabs) |
| `feature/landing-light-theme-redesign` | Active | Full landing page redesign |

---

## What's Next (not yet built)

- [ ] Real adapter integrations (Salesforce, Zendesk, HubSpot)
- [ ] VPC / self-hosted deployment option
- [ ] SDK (Python, TypeScript) for agent integration
- [ ] Escalation flow (ESCALATED → human approval → resume)
- [ ] Multi-policy support (multiple rules per action type)
- [ ] Landing: Blog section
- [ ] Landing: Docs site

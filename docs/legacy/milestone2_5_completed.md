# Milestone 2.5 — Completed

**Customer Ops "Account State Pack" (Wedge Packaging)**

Reference: [STATIS_CONTEXT.md](../statis_context.md), [milestone.md](../milestone.md).

---

## Scope completed

- **Event-type alias layer**: Legacy names (`ticket.updated`, `plan.changed`) resolve to canonical names (`support.ticket_updated`, `billing.plan_changed`) in the reducer dispatcher. Event log stores original names as-is.
- **Account v2 schema**: Opinionated state shape with `blockers`, `risk_flags`, `sentiment`, `open_incidents`, `churn_risk`, `next_actions`, `plan`, and `extensions`. Schema version embedded in state dict.
- **6 reducers**: `support.ticket_updated`, `support.incident_reported`, `support.sentiment_updated`, `billing.plan_changed`, `csm.escalation_requested`, `account.schema_migrated`.
- **Conflict rules**: Source-precedence system (system > human > agent) for contested fields like sentiment.
- **v1 to v2 migration**: Lazy upgrade-on-write via `ensure_v2()` in every reducer, plus explicit `account.schema_migrated` event for audit.
- **CSM demo script**: `examples/csm_demo.py` posts 7 events and prints state transitions.
- **Golden snapshot test**: Hardcoded event stream producing a known final state dict and hash.
- **Full unit + integration test suites** covering all reducers, aliases, schema upgrade, conflict rules, determinism, and alias equivalence.
- **Docs**: `docs/state_pack_account.md` with schema, reducer behavior, conflict rules, migration path, and alias table.
- **Out of scope**: Subscriptions, delivery worker, replay (later milestones).

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Alias layer + registry | `api/app/reducers/registry.py` |
| Account v2 schema helpers | `api/app/reducers/account_schema.py` |
| v2 reducers (6 types) | `api/app/reducers/account.py` |
| Conflict rules | `api/app/reducers/conflict_rules.py` |
| CSM demo script | `examples/csm_demo.py` |
| Unit tests (reducers) | `api/tests/unit/test_account_pack.py` |
| Golden snapshot test | `api/tests/unit/test_golden_snapshot.py` |
| Updated M2 reducer tests | `api/tests/unit/test_reducers.py` |
| Integration tests | `api/tests/integration/test_account_pack.py` |
| State pack docs | `docs/state_pack_account.md` |

---

## Key implementation details

- **Alias resolution**: `_ALIASES` dict in `registry.py` maps old -> canonical names. `get_reducer()` and `has_reducer()` resolve through aliases before lookup. Zero impact on event storage.
- **Lazy v1->v2 upgrade**: Every reducer calls `ensure_v2(state)` which deep-copies and upgrades if needed. Legacy `tickets` map becomes `open_incidents` entries + preserved under `extensions.tickets`.
- **Conflict rules**: `should_apply(existing_source, new_source)` uses numeric precedence ranks. Sentiment reducer uses this to prevent agent from overwriting system/human sentiment.
- **churn_risk derivation**: Computed automatically by `ticket_updated` and `incident_reported` reducers — true when 3+ non-closed incidents exist.
- **Plan downgrade detection**: `plan_changed` compares old vs new plan rank and appends `risk_flags` entry on downgrade.

---

## How to run

```bash
cd api
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg://USER:PASS@HOST:PORT/DB"
alembic upgrade head
uvicorn app.main:app --reload

# Run the CSM demo:
python examples/csm_demo.py

# Unit tests (no DB):
pytest tests/unit -v

# Integration tests (Postgres + testcontainers):
pytest tests/integration -v -m integration
```

---

## Acceptance checks (met)

- [x] Opinionated account v2 schema with all specified fields (blockers, risk_flags, sentiment, open_incidents, churn_risk, next_actions).
- [x] 5 domain reducers + 1 migration reducer registered and aliased.
- [x] Conflict rules with source precedence (system > human > agent) documented and tested.
- [x] Wedge determinism test: same inputs produce same state and hash.
- [x] Schema validation: reducers gracefully handle missing payload keys.
- [x] Golden snapshot test: known event stream produces expected final account state JSON + hash.
- [x] `examples/csm_demo.py` runs and produces expected account_state transitions without requiring subscriptions.
- [x] `docs/state_pack_account.md` documents state schema, each reducer, conflict rules, and migration path.

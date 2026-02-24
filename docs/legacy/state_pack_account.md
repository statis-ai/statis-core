# Account State Pack (v2)

The Account State Pack is the opinionated wedge built on top of Statis's primitives. It provides a ready-to-use materialized state schema for customer-ops teams coordinating across Support, Billing, and CSM agents.

## State schema (`account.v2`)

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | `"account.v2"` | Always present; identifies the shape |
| `blockers` | `string[]` | Active blockers (auto-added on high-severity incidents) |
| `risk_flags` | `string[]` | Risk signals (e.g. `plan_downgrade:enterprise->pro`) |
| `sentiment` | `object or null` | `{ label, updated_at, source }` |
| `open_incidents` | `object[]` | `{ id, type, status, occurred_at }` |
| `churn_risk` | `boolean` | True when 3+ open incidents |
| `next_actions` | `object[]` | `{ owner, action, reason }` |
| `plan` | `string or null` | Current billing plan |
| `extensions` | `object` | Legacy/extra fields from v1 upgrade |

## Reducers

### `support.ticket_updated`

Alias: `ticket.updated`

Upserts a ticket into `open_incidents` by `ticket_id`. Recalculates `churn_risk` (true when 3+ non-closed incidents).

**Payload**: `{ ticket_id, status, occurred_at? }`

### `support.incident_reported`

Appends a new incident to `open_incidents`. If severity is `high` or `critical`, adds the summary to `blockers`. Recalculates `churn_risk`.

**Payload**: `{ incident_id, type, status, severity, summary?, occurred_at? }`

### `support.sentiment_updated`

Sets `sentiment` with source-precedence check. A lower-precedence producer cannot overwrite a higher-precedence one.

**Payload**: `{ label, updated_at? }`

### `billing.plan_changed`

Alias: `plan.changed`

Sets `plan`. If the change is a downgrade (by plan rank), appends a `plan_downgrade:old->new` entry to `risk_flags`.

Plan rank (lowest to highest): `free < starter < pro < enterprise`.

**Payload**: `{ plan }`

### `csm.escalation_requested`

Appends an action to `next_actions`.

**Payload**: `{ owner, action, reason }`

### `account.schema_migrated`

Deterministically transforms v1 state to v2. Idempotent if already v2. Legacy fields are preserved under `extensions`.

**Payload**: `{}` (empty)

## Conflict rules

### Source precedence

When two events set the same contested field (e.g. `sentiment`), the source with higher precedence wins:

| Rank | Source keyword | Example producers |
|------|----------------|-------------------|
| 3 | `system` | `system-billing`, `system-monitor` |
| 2 | `human` | `human-csm`, `human-support` |
| 1 | `agent` | `agent-support`, `agent-billing` |
| 0 | (default) | Any other producer string |

Equal precedence: the later event (per ingestion order) wins.

### Tie-breaking

The deterministic ordering key `(occurred_at ASC, ingested_at ASC, event_id ASC)` is the ultimate tie-breaker for all state derivation.

## Migration: v1 to v2

### Explicit migration event (recommended for audit)

Post an `account.schema_migrated` event for the entity. The reducer transforms the v1 state to v2 and records the event in provenance.

### Lazy upgrade-on-write

All v2 reducers call `ensure_v2(state)` before applying domain logic. If the current state is v1 (or empty), it is upgraded automatically. This means any new event targeting a v1 entity will produce a v2 state.

### What happens to v1 fields

- `plan` maps directly to `v2.plan`.
- `tickets` entries become `open_incidents` entries and are also preserved in `extensions.tickets`.
- Any other v1 keys are moved to `extensions`.

## Event-type aliases

| Legacy name | Canonical name |
|-------------|----------------|
| `ticket.updated` | `support.ticket_updated` |
| `plan.changed` | `billing.plan_changed` |

The event log always stores the original event_type as-is (immutable). Aliasing happens only in the reducer dispatcher.

## Running the demo

```bash
cd api && uvicorn app.main:app --reload
# In another terminal:
python examples/csm_demo.py
```

The demo posts 7 events covering all reducer types and prints the account state after each step.

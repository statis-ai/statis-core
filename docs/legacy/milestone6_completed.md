# Milestone 6 — CSM Demo Scenario (The "aha") — Completed

**Completed:** 2026-02-20

## Summary

Extended the CSM demo to show **PUSH** (webhook deliveries), added a runnable webhook receiver, documented the full demo flow, and added an E2E test that asserts final state, state hash, and delivery records/trace.

## What Was Implemented

### 1. Webhook receiver ([examples/webhook_receiver.py](examples/webhook_receiver.py))

- Minimal stdlib HTTP server (no extra deps) binding to configurable host/port (default `localhost:9999`).
- Accepts `POST /` and prints JSON payloads to stdout with a timestamp.
- `--fail-first N`: returns 500 for the first N requests, then 200 (for retry/DLQ demos).

### 2. Extended CSM demo ([examples/csm_demo.py](examples/csm_demo.py))

- **`--webhook-url URL`**: before posting events, creates a subscription via `POST /subscriptions` with `entity_type=account` and `destination=URL`.
- After posting the scenario events, prints "Pushes to receivers" and polls `GET /delivery-trace/{subscription_id}` three times (2s apart), printing counts by status (pending, sent, failed, dead).
- Prints instructions to start the worker and the delivery-trace curl.

### 3. Documentation ([docs/demo_csm.md](docs/demo_csm.md))

- Step-by-step: Postgres + migrations, start API, (optional) webhook receiver, run csm_demo with `--webhook-url`, start worker, inspect delivery trace and state.
- Expected output snippets and a summary table of commands.

### 4. E2E integration test ([api/tests/integration/test_csm_demo_e2e.py](api/tests/integration/test_csm_demo_e2e.py))

- **test_final_state_shape_and_hash**: posts the same 7-event CSM scenario, then asserts `GET /state/account/{entity_id}` returns state with expected shape (plan, churn_risk, blockers, open_incidents, next_actions, sentiment, schema_version), `state_version == 7`, and a non-empty, stable `state_hash`.
- **test_delivery_records_and_trace_present**: creates a subscription, posts the 7 events, then asserts `GET /delivery-trace/{subscription_id}` returns at least 7 deliveries with expected fields (subscription_id, entity_type, entity_id, status, dedupe_key, attempt_count).

## Acceptance Criteria

- csm_demo seeds outage + sentiment + plan change and shows state transitions **and** pushes to receivers (via subscription + delivery trace in the flow).
- webhook_receiver prints payloads and can simulate 500s for retry test (`--fail-first N`).
- docs/demo_csm.md has step-by-step commands and expected outputs.
- E2E automated test seeds events and asserts final state JSON + hash and delivery records + trace present.

## How to Run

- **Demo:** See [docs/demo_csm.md](docs/demo_csm.md).
- **E2E tests:** `cd api && python3 -m pytest tests/integration/test_csm_demo_e2e.py -v`

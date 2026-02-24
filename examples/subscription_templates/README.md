# Subscription Templates

Example subscription configurations for `POST /subscriptions`.

Each JSON file represents a starter subscription that can be posted directly to the API (remove the `_description` field first, or leave it — the API ignores unknown fields).

## Usage

```bash
# Create a subscription from a template
curl -s http://localhost:8000/subscriptions \
  -H "Content-Type: application/json" \
  -d @sales_pause.json | python -m json.tool
```

## Templates

| File | Purpose |
|------|---------|
| `sales_pause.json` | Pause sales outreach on plan downgrades |
| `billing_pause_dunning.json` | Pause dunning workflows on plan upgrades |
| `csm_escalate.json` | Alert CSM team on escalations and incidents |

## Predicates

Currently, subscriptions filter on `entity_type` and optionally `event_types`. More granular predicate-based filtering (e.g., "only when health_score < 50") is planned for a future milestone.

# Outreach Research Agent

Daily research + cold-outreach agent. Discovers ICP signals across HN and GitHub,
scores prospects with Claude, drafts personalized DMs, and routes every meaningful
event through Statis. Each step writes a receipt to the ledger; sends are escalated
to the console for manual approval.

## v0 status (today)

- Real LLM scoring + drafting against real prospects
- Real Statis receipts on the ledger (production API)
- LinkedIn delivery is **mocked** via `MockLinkedInAdapter` — the worker writes
  a JSON line to `/tmp/statis_linkedin_mock.log` instead of calling LinkedIn.
  Swap in `UnipileLinkedInAdapter` once Unipile auth is wired (v1).
- Sheet logging is local CSV at `agents/outreach/outreach_log.csv` — same
  schema as the eventual Google Sheet. Drop-in replacement in v1.

## Files

| File | Purpose |
|---|---|
| `main.py` | Daily entrypoint. `python -m agents.outreach.main --max-prospects 5` |
| `research.py` | HN Algolia + GitHub Search API — read-only signal collection |
| `score.py` | Statis Kit hygiene + Claude Sonnet scoring + `statis.execute(prospect_scored)` |
| `draft.py` | Statis Kit hygiene + Claude drafting + `statis.execute(outreach_draft_message)` |
| `send.py` | `statis.execute(linkedin_send_message)` + `statis.execute(sheets_append_row)` + CSV |
| `llm.py` | Thin Anthropic API wrapper — single function, no SDK dep |
| `agents.json` | Agent registration payload |
| `policies.yaml` | 11 policy rules across 6 action_types |
| `bootstrap.sh` | Registers agent + applies policies + verifies via simulate |

## Run

```bash
export STATIS_API_KEY=st_...
export ANTHROPIC_API_KEY=sk-ant-...
export STATIS_BASE_URL=https://statis-core.onrender.com  # optional, default

# One-time: register agent + apply policies
./agents/outreach/bootstrap.sh

# Daily run
python -m agents.outreach.main --max-prospects 5
```

Output: ~30-50 receipts on https://console.statis.dev. Sends queue as escalations
in the console — approve/reject from there. Approved sends are picked up by the
worker and "delivered" via the mock adapter (logs to `/tmp/statis_linkedin_mock.log`).

## Pipeline

```
research.discover()
   ↓ list[Candidate]
score.score_one()         → statis.execute(prospect_scored)
   ↓ ScoredProspect
draft.draft_one()         → statis.execute(outreach_draft_message)
   ↓ DraftedMessage
send.send_and_log()       → statis.execute(linkedin_send_message)
                          → statis.execute(sheets_append_row)
                          → CSV row
```

Per prospect: 4 receipts on the ledger when score>=70, 2 when score<60.

## Why this exists

The agent is a working dogfood of all three Statis pillars on a single workflow:

1. **Context In (Kit)** — `statis_kit.process()` runs Guard against scraped HN/GitHub
   text before it reaches the LLM. Real defense against prompt-injection attacks
   embedded in public posts.
2. **Action Out** — every send/draft/score/log is gated through `statis.execute()`.
   Policy rules can deny, escalate, or approve. Aniket approves every send in the
   console (week 1-2); rules graduate to auto-approve in week 4+.
3. **Receipt Through** — every action writes a tamper-evident receipt with hash
   chain. The CSV stores the receipt IDs alongside the message so a prospect can
   see the receipt that approved their cold message.

Receipts compound: 5 prospects/day × 4 receipts/prospect × 30 days ≈ 600 receipts.
Add the infra gate agent (Vercel/Neon/Render) and issue triage agent and you reach
~2.5k-7.5k receipts in 30 days. The console traffic is the demo.

## v1 follow-ups (next 1-2 weeks)

- Unipile API integration (replace MockLinkedInAdapter)
- Google Sheets API (replace CSV)
- Slack DM notification on every escalation
- Webhook receiver for async sheet update after deferred approvals
- `signal_age_days_*` condition handler + freshness guard rule
- Alembic migration for `outreach_scheduled_actions` table
- Stage 6 (schedule follow-up) + Stage 7 (reply detection)
- Render cron deploy

See `/Users/aniketkumar/.claude/plans/system-instruction-you-are-working-precious-yeti.md` for the full plan.

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

## Browser Testing Rule

**Before reporting any console or landing page feature as complete, verify it end-to-end in a real browser using Playwright.**

- Use the Playwright MCP plugin or the project's Playwright node_modules directly.
- Chromium binary: `/home/aniket/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`
- Run with: `PLAYWRIGHT_BROWSERS_PATH=/home/aniket/.cache/ms-playwright node <script>.js` from `console/`
- Test the full user flow, not just individual API calls.
- Allow up to 90 seconds for Render cold starts on first request.
- Do not report success to Aniket until the browser test passes end-to-end.

---

## Project Overview

**Statis is the trust layer for production AI agents.** Three pillars, three tiers.

### The three pillars

1. **Context In** — pre-call hygiene. Strip prompt injection, redact PII/secrets, compress history, meter token cost before the model call.
2. **Action Out** — policy-gated tool execution. Agents propose before executing; deterministic rules evaluate; distributed lock enforces exactly-once; escalation + kill switch for humans in the loop.
3. **Receipt Through** — tamper-evident cryptographic proof of every transform and execution. SHA-256 hash chain today; signed receipts verifiable offline in Teams tier.

Never lead with "MCP tool" or "context-only" framing. The three pillars together are the product; each is weaker alone.

### The three tiers

| Tier | What it is | State (2026-04-16) |
|---|---|---|
| **OSS Kit** — `statis-kit` | Offline, in-process Context-In primitives (guard + compressor + meter). No auth, no network. | **Shipped** to [PyPI](https://pypi.org/project/statis-kit/) + [npm](https://www.npmjs.com/package/statis-kit) at 0.1.1. Playground live at [statis.dev/debug](https://www.statis.dev/debug). |
| **Developer Cloud** — `statis-ai` SDK + hosted API | Policy engine, execution ledger, escalation, console. Pillars 2 + 3 for individual/team developers. | **Largely built** (api/ + worker/ + console/). Free during beta — no Stripe at launch. |
| **Enterprise Governance** | On-prem/VPC, SSO+SCIM, immutable audit, compliance exports (SOC2/HIPAA/SEC), admission engine. | Roughly 70% exists in api/; the Enterprise-only adds (SSO, SCIM, VPC deploy, compliance bundle) are contract-driven, not speculative. |

The tier pivot was locked 2026-04-14 — see [memory/project_tier_strategy.md](/Users/aniketkumar/.claude/projects/-Users-aniketkumar-statis/memory/project_tier_strategy.md) and [.claude/plans/kit-tier-strategy.md](/Users/aniketkumar/.claude/plans/kit-tier-strategy.md).

### The dividing rule (for any "OSS or paid?" question)

> Works on a single call with no infrastructure → OSS Kit. Requires correlation across calls, storage, identity, or a hosted service → Developer Cloud / Enterprise.

### Repo layout

**Repo:** `/home/aniket/statis/statis-core`

| Directory | Tier | What it is |
|---|---|---|
| `kit/` | OSS | Python statis-kit package (guard/compress/meter) |
| `kit-ts/` | OSS | TypeScript statis-kit package (mirrored) |
| `landing/` | OSS surface | Marketing + /debug playground bundling kit-ts |
| `sdk/` | Developer Cloud | Python statis-ai SDK (propose/execute/simulate) — re-exports kit |
| `sdk-ts/` | Developer Cloud | TypeScript statis-ai SDK — re-exports kit |
| `api/` | Developer Cloud | FastAPI backend (policy engine, ledger, escalation) |
| `worker/` | Developer Cloud | Execution worker (poll APPROVED, call adapter, write receipt) |
| `console/` | Developer Cloud | Next.js operator UI |
| `docs/` | all | Mintlify docs |

**Run tests:** `cd api && python -m pytest tests/unit/ -v`
**Run migrations:** `cd api && DATABASE_URL=<url> python -m alembic upgrade head`
**DB:** Neon PostgreSQL (connection string in session — not stored here)

See `STATUS.md` for full build state. **Note:** `STATUS.md` was last updated 2026-04-04 and still uses the pre-pivot "agent execution infrastructure" framing — refresh it next time a Cloud feature ships.

**Ops repo (cross-workstream context):** `/home/aniket/statis/statis-ops`
At session start, also read `statis-ops/SYNC.md` for signals from other workstreams (landing, accelerator, marketing, security).

---

## statis-kit (OSS Context Kit)

Shipped 2026-04-16. Published as `statis-kit` on [PyPI](https://pypi.org/project/statis-kit/) and [npm](https://www.npmjs.com/package/statis-kit). Source: `kit/` (Python) + `kit-ts/` (TypeScript).

**What it is:** offline pre-call hygiene for LLM message arrays. Three capabilities, zero network, zero auth:
- **Guard** — pattern-based prompt-injection detection
- **Compressor** — three-pass classify/summarize/prune (pinned + recent-window + superseded detection)
- **Meter** — token counts + per-turn USD cost across GPT-4o/4.1, Claude 4 family, Gemini 2.0/2.5

Browser playground at [statis.dev/debug](https://www.statis.dev/debug) — the kit-ts bundle runs entirely client-side.

### How developers actually use it

The kit is for **developers calling the provider APIs from code**, not for end-users chatting at claude.ai / chat.openai.com / gemini.google.com. Those three web UIs don't expose pre-send hooks.

Primary integration pattern — one wrap before every API call:

```python
# Anthropic Claude API
from anthropic import Anthropic
from statis_kit import process, KitConfig, GuardConfig, CompressorConfig, MeterConfig

client = Anthropic()
clean = process(messages, KitConfig(
    guard=GuardConfig(on_detect="strip"),
    compressor=CompressorConfig(pin_top=1, recent_turns=4),
    meter=MeterConfig(model="claude-opus-4"),
))
resp = client.messages.create(model="claude-opus-4-20250514", messages=clean.messages, max_tokens=1024)
```

```typescript
// OpenAI ChatGPT API
import OpenAI from "openai";
import { process } from "statis-kit";

const clean = process(messages, {
  guard: { on_detect: "strip" },
  compressor: { pin_top: 1, recent_turns: 4 },
  meter: { model: "gpt-4o" },
});
const resp = await openai.chat.completions.create({ model: "gpt-4o", messages: clean.messages });
```

Gemini uses the same OpenAI-format message shape — convert once at the boundary of the Google SDK.

**Framework integration** (not yet shipped — roadmap): LangChain `BaseCallbackHandler`, Vercel AI SDK `middleware`, LlamaIndex input-component, DSPy request transform. Each is ~20 lines once built.

**End users** of the chat web apps can only use the kit via [statis.dev/debug](https://www.statis.dev/debug) — paste export, see what the conversation would cost per replay, copy a compressed version back into a new chat. Diagnostic, not a pipe.

### Scope discipline (what kit is NOT)

Explicitly out of scope — these are adjacent-vendor territory and belong elsewhere:
- Retrieval / vector search (pgvector, Pinecone, LangChain retrievers)
- Long-term memory (Mem0, Zep)
- LLM evaluation (Ragas, LangSmith, Braintrust)
- Browser extension / claude.ai script injection
- Proxy server (if gateway is needed, that's Statis Cloud — not the kit)
- ML-based entity recognition for redaction (Presidio, spaCy NER)

The rule: **anything that works on a single call with no infrastructure belongs in kit**. Anything requiring cross-call correlation, storage, identity, or a hosted service belongs in Statis Cloud (Teams/Enterprise tier).

### Tier strategy

See [.claude/plans/kit-tier-strategy.md](/Users/aniketkumar/.claude/plans/kit-tier-strategy.md) for the full OSS vs Teams vs Enterprise feature split and what to add/improve in each tier.

### Key files

- `kit/src/statis_kit/__init__.py` — `process()` entry point, pipeline wiring
- `kit/src/statis_kit/guard.py` — Guard class + `_patterns.py`
- `kit/src/statis_kit/compressor.py` — three-pass compressor
- `kit/src/statis_kit/cost_meter.py` — CostMeter + `_pricing.py` / `data/pricing.yaml`
- `kit-ts/src/` — mirrored TypeScript implementation
- `kit/examples/run_fitness.py` — 46-turn real Claude session, 81.5% token reduction benchmark
- `landing/src/components/ui/ContextPlayground.tsx` — browser playground bundling kit-ts

### Commands

```bash
cd kit      && python -m pytest tests/ -v                 # Python tests
cd kit-ts   && npm run build && npm test                  # TS tests
cd kit      && python examples/run_fitness.py             # dogfood benchmark
statis-kit diff before.json after.json                    # CLI diff (Python)
npx statis-kit diff before.json after.json                # CLI diff (npm)
```

### Publishing (both registries)

```bash
# PyPI — from kit/
.buildvenv/bin/python -m build && TWINE_USERNAME=__token__ TWINE_PASSWORD=<token> .buildvenv/bin/twine upload dist/*

# npm — from kit-ts/
npm publish --access public
```

Bump version in `kit/pyproject.toml` AND `kit-ts/package.json` together — they version in lockstep.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. The
skill has multi-step workflows, checklists, and quality gates that produce better
results than an ad-hoc answer. When in doubt, invoke the skill. A false positive is
cheaper than a false negative.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke /office-hours
- Strategy, scope, "think bigger", "what should we build" → invoke /plan-ceo-review
- Architecture, "does this design make sense" → invoke /plan-eng-review
- Design system, brand, "how should this look" → invoke /design-consultation
- Design review of a plan → invoke /plan-design-review
- Developer experience of a plan → invoke /plan-devex-review
- "Review everything", full review pipeline → invoke /autoplan
- Bugs, errors, "why is this broken", "wtf", "this doesn't work" → invoke /investigate
- Test the site, find bugs, "does this work" → invoke /qa (or /qa-only for report only)
- Code review, check the diff, "look at my changes" → invoke /review
- Visual polish, design audit, "this looks off" → invoke /design-review
- Developer experience audit, try onboarding → invoke /devex-review
- Ship, deploy, create a PR, "send it" → invoke /ship
- Merge + deploy + verify → invoke /land-and-deploy
- Configure deployment → invoke /setup-deploy
- Post-deploy monitoring → invoke /canary
- Update docs after shipping → invoke /document-release
- Weekly retro, "how'd we do" → invoke /retro
- Second opinion, codex review → invoke /codex
- Safety mode, careful mode, lock it down → invoke /careful or /guard
- Restrict edits to a directory → invoke /freeze or /unfreeze
- Upgrade gstack → invoke /gstack-upgrade
- Save progress, "save my work" → invoke /context-save
- Resume, restore, "where was I" → invoke /context-restore
- Security audit, OWASP, "is this secure" → invoke /cso
- Make a PDF, document, publication → invoke /make-pdf
- Launch real browser for QA → invoke /open-gstack-browser
- Import cookies for authenticated testing → invoke /setup-browser-cookies
- Performance regression, page speed, benchmarks → invoke /benchmark
- Review what gstack has learned → invoke /learn
- Tune question sensitivity → invoke /plan-tune
- Code quality dashboard → invoke /health

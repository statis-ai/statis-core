# statis-ai

**The trust layer for production AI agents.** One decorator turns any function
into a policy-gated, audit-logged tool call. No agent framework lock-in, no
proxy in front of your model, no rewrites.

`statis-ai` is the Python SDK for [Statis](https://statis.dev). Drop it in
front of any side-effectful function your agent calls — Stripe refunds,
internal APIs, database writes — and Statis evaluates a deterministic policy
*before* the function executes, then writes a signed receipt of the decision.

```python
from statis import gate

@gate(action_name="issue_refund")
def issue_refund(charge_id: str, recipient_email: str, cents: int) -> dict:
    return stripe.Refund.create(charge=charge_id, amount=cents)
```

The decorator does three things on every call:

1. **Context In** — Strips prompt injections, redacts PII, meters tokens
   *before* the model call. (Re-exported from
   [`statis-kit`](https://pypi.org/project/statis-kit/), our open-source pre-call
   hygiene library.)
2. **Action Out** — Sends the proposed call to the Statis policy engine.
   Approved → executes. Denied → raises `ActionDeniedError` with a receipt.
   Escalated → human approves in the console; agent resumes.
3. **Receipt Through** — Every decision is recorded in an Ed25519-signed,
   hash-chained ledger. Verifiable offline with the public key at
   `/.well-known/aarm-pubkey`.

## Install

```bash
pip install statis-ai
# optional: receipt signature verification (offline)
pip install "statis-ai[verify]"
```

Set your API key:

```bash
export STATIS_API_KEY=st_...
```

(Get one for free during beta at [statis.dev](https://statis.dev).)

## Quick start — gate a function

```python
from statis import gate, ActionDeniedError

@gate(
    action_name="issue_refund",
    entity=lambda: {"customer_id": "CUST-7781"},
    target_system="stripe",
    timeout_s=10,
)
def issue_refund(charge_id: str, recipient_email: str, cents: int) -> dict:
    """Issue a Stripe refund. Only runs after the policy engine approves."""
    return {"id": f"re_{charge_id[-6:]}", "amount": cents, "status": "succeeded"}


try:
    result = issue_refund(
        charge_id="ch_3PxOrder9921",
        recipient_email="alice@bigcustomer.com",
        cents=4999,
    )
    print("approved:", result)

except ActionDeniedError as e:
    print(f"denied by rule {e.receipt.rule_id}: {e}")
    # e.receipt has receipt_id, hash, signature — audit-ready, no extra wiring.
```

## Policy as code

Rules are deterministic YAML, evaluated server-side per call. No LLM in the
decision path:

```yaml
- rule_id: refund_recipient_must_match_state
  action_type: issue_refund
  conditions:
    recipient_matches_customer_of_record: true
  decision: APPROVED
  priority: 100
```

Apply with the CLI:

```bash
statis policy apply policies.yaml
```

## What you get out of the box

- `@statis.gate` decorator — sync + async, idempotent, with timeout + escalation
- `StatisClient` — lower-level access for custom flows
- `process_context()` — re-exported from `statis-kit` for one-line pre-call
  hygiene (Guard + Compressor + Meter)
- CLI — `statis init`, `statis policy apply`, `statis receipts list`,
  `statis receipts verify`
- Distributed lock + at-most-once execution semantics
- Console (web UI) for approvals, escalations, kill-switch, and receipt
  verification

## Free during beta

The Developer Cloud (policy engine, ledger, console) is **free while in beta**
— no Stripe at launch. Self-hosted Enterprise (SSO, SCIM, VPC, compliance
exports) is contract-driven.

## Links

- **Homepage** → [statis.dev](https://statis.dev)
- **Source** → [github.com/statis-ai/statis-core](https://github.com/statis-ai/statis-core)
- **OSS kit** → [`statis-kit`](https://pypi.org/project/statis-kit/) (the
  Context-In primitives — works offline, no API key required)
- **TypeScript SDK** → `npm install statis-ai`

## License

MIT.

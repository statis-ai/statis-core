"""
Attack Demo — customer-support agent caught mid-exfil.

Three pillars, two defenses, one cryptographic record.

  Pillar 1 — Context In  (statis-kit Guard strips injection from ticket body)
  Pillar 2 — Action Out  (@statis.gate policy denies on recipient mismatch)
  Pillar 3 — Receipt     (Ed25519 signed, hash-chained record of both attempts)

Usage:
    export STATIS_API_KEY=st_...
    export STATIS_BASE_URL=https://api.statis.dev   # or http://localhost:8000
    python demo/attack/agent.py

Run seed.py first if the policy rule doesn't exist yet.
LLM choice: deterministic stand-in (no LLM dependency; see README for live variant).
"""
from __future__ import annotations

import os
import sys
import time

# Allow running directly from the demo/attack/ directory.
sys.path.insert(0, os.path.dirname(__file__))

from ticket_fixture import (
    AUTHORITY_IMPERSONATION_PATTERN,
    CUSTOMER,
    INSTRUCTION_OVERRIDE_PATTERN,
    RECIPIENT_REDIRECT_PATTERN,
    TICKET,
)

import statis
from statis import ActionDeniedError, gate
from statis_kit import Guard, GuardConfig, Message


# ---------------------------------------------------------------------------
# Pillar 2 — @statis.gate decorated refund function
# ---------------------------------------------------------------------------

@gate(
    action_name="issue_refund",
    entity=lambda: {
        "customer_id": CUSTOMER["customer_id"],
        "email_of_record": CUSTOMER["email_of_record"],
        "charge_id": CUSTOMER["charge_id"],
    },
    target_system="stripe_mock",
    timeout_s=10,
)
def issue_refund(charge_id: str, recipient_email: str, cents: int) -> dict:
    """Issue a refund via Stripe. Only executes after policy approval."""
    return {
        "refund_id": f"re_{charge_id[-8:]}",
        "recipient": recipient_email,
        "amount_usd": cents / 100,
        "status": "succeeded",
    }


# ---------------------------------------------------------------------------
# Deterministic LLM stand-in
# ---------------------------------------------------------------------------

def _agent_reason(clean_body: str, ticket: dict) -> tuple[str, str, int]:
    """Parse order details and compose refund parameters.

    Uses the structured ticket header (from_email) as the recipient,
    not the free-form body — correct agent behaviour for a structured ticket system.

    Returns: (charge_id, recipient_email, cents)
    """
    import re

    order_match = re.search(r"ORD-(\d+)", clean_body)
    amount_match = re.search(r"\$(\d+\.\d+)", clean_body)

    order_suffix = order_match.group(1) if order_match else "9921"
    cents = int(float(amount_match.group(1)) * 100) if amount_match else CUSTOMER["amount_cents"]
    charge_id = f"ch_3PxOrder{order_suffix}"

    # Structured metadata takes precedence over free-form body content.
    recipient_email = ticket["from_email"]

    return charge_id, recipient_email, cents


# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

def _sep(char: str = "─", width: int = 60) -> str:
    return char * width


def _pause(label: str = "") -> None:
    """Pause for narration. Press Enter to continue.

    Set STATIS_DEMO_AUTO=1 to auto-advance after STATIS_DEMO_PAUSE_S seconds
    (default 4) — useful for unattended demos or CI smoke tests.
    """
    if os.environ.get("STATIS_DEMO_AUTO") == "1":
        time.sleep(float(os.environ.get("STATIS_DEMO_PAUSE_S", "4")))
        return
    try:
        prompt = "  [press Enter" + (f" — {label}" if label else "") + "]"
        input(prompt)
        # Move cursor up to the prompt line and clear from there to end of screen.
        # \033[J (clear-to-end) handles wrapped prompts that \033[K would leave behind.
        sys.stdout.write("\033[F\033[J")
        sys.stdout.flush()
    except (EOFError, KeyboardInterrupt):
        print()


def _format_clean_body(text: str) -> str:
    """Normalize whitespace and ensure a closing period."""
    import re
    collapsed = re.sub(r"\s+", " ", text).strip()
    if collapsed and collapsed[-1] not in ".!?":
        collapsed += "."
    return collapsed


def _short(value: str, n: int = 8) -> str:
    return value[:n] + "..."


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print()
    print(_sep("━"))
    print("  ATTACK DEMO — customer-support agent")
    print(_sep("━"))

    # ── Show the raw ticket ──────────────────────────────────────────────────
    print()
    print("ticket received")
    print(f"  id:      {TICKET['ticket_id']}")
    print(f"  from:    {TICKET['from_email']}  ← header (CLAIMED sender)")
    print(f"  subject: {TICKET['subject']}")
    print(f"  body:")
    for line in TICKET["body"].splitlines():
        print(f"    {line}")
    print()

    _pause("show the injection")

    # ── Pillar 1: Guard ──────────────────────────────────────────────────────
    print(_sep())
    print("Pillar 1 — Context In (statis-kit Guard, runs locally)")
    print(_sep())

    guard = Guard(GuardConfig(
        on_detect="strip",
        extra_patterns=[
            INSTRUCTION_OVERRIDE_PATTERN,
            AUTHORITY_IMPERSONATION_PATTERN,
            RECIPIENT_REDIRECT_PATTERN,
        ],
    ))
    ticket_message = Message(role="tool", content=TICKET["body"])
    result = guard.scan([ticket_message])

    # Order: instruction_override (most recognizable) → authority_impersonation → recipient_redirect.
    category_order = {
        "instruction_override": 0,
        "authority_impersonation": 1,
        "recipient_redirect": 2,
    }
    sorted_dets = sorted(
        result.detections,
        key=lambda d: category_order.get(d.category, 99),
    )

    if sorted_dets:
        for det in sorted_dets:
            print(f"  DETECTED  category={det.category:<25}pattern={det.pattern_id}")
        print(f"  action:   strip all" if len(sorted_dets) > 1 else "  action:   strip")

        # Strip in length-descending order so longer (potentially overlapping)
        # matches consume their shorter substrings cleanly. Guard's built-in
        # strip iterates in detection order, which can leave residue when
        # patterns overlap — handled here in the demo to keep the kit
        # surface unchanged.
        stripped = TICKET["body"]
        for det in sorted(result.detections, key=lambda d: -len(d.matched_text)):
            stripped = stripped.replace(det.matched_text, "")
        clean_body = _format_clean_body(stripped)
        print(f"  clean body delivered to model:")
        print(f"    {clean_body}")
    else:
        print("  no injection detected")
        clean_body = TICKET["body"]

    print()

    _pause("Pillar 1 stripped both — explain Guard")

    # ── Deterministic LLM stand-in ───────────────────────────────────────────
    charge_id, recipient_email, cents = _agent_reason(clean_body, TICKET)
    print("agent reasoning")
    print(f"  order → charge {charge_id} → ${cents / 100:.2f}")
    print(f"  recipient → {recipient_email}  (from ticket header)")
    print()

    _pause("but the header is spoofed — watch Pillar 2")

    # ── Pillar 2: @statis.gate ───────────────────────────────────────────────
    print(_sep())
    print("Pillar 2 — Action Out (@statis.gate, evaluates against live state)")
    print(_sep())
    print(f"  proposing: issue_refund(")
    print(f"    charge_id={charge_id!r},")
    print(f"    recipient_email={recipient_email!r},")
    print(f"    cents={cents}")
    print(f"  )")
    print(f"  policy lookup → customer of record for ORD-{charge_id[-4:]}")
    print(
        f"  entity state: {CUSTOMER['email_of_record']}  "
        f"(verified, last updated {CUSTOMER['email_verified_relative']})"
    )
    print(f"  proposed:     {recipient_email}")
    print()

    try:
        issue_refund(charge_id=charge_id, recipient_email=recipient_email, cents=cents)
        print("  APPROVED — refund executed (unexpected in this demo)")

    except ActionDeniedError as e:
        r = e.receipt
        print(f"  DENIED — rule: {r.rule_id}")
        print(f"  reason: header sender does not match customer of record on file")
        print()

        _pause("Pillar 2 denied it — now show the receipt")

        # ── Pillar 3: Receipt ────────────────────────────────────────────────
        print(_sep())
        print("Pillar 3 — Receipt Through (Ed25519 signed, hash-chained)")
        print(_sep())
        print(f"  receipt_id: {r.receipt_id}")
        print(f"  decision:   {r.decision}")
        print(f"  rule:       {r.rule_id}")
        print(f"  evaluated:  recipient (proposed) ≠ recipient (state)")
        print(f"  hash:       {_short(r.hash)} (chains to prev receipt)")
        console_base = os.environ.get("STATIS_CONSOLE_URL", "https://console.statis.dev")
        print(f"  console → {console_base}/receipts/{r.receipt_id}")
        print()

        _pause("switch to browser to show the receipt")

    except Exception as e:
        print(f"  error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

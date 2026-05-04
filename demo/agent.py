"""
Statis demo — @statis.gate in 90 seconds.

Usage:
    export STATIS_API_KEY=sk-...
    python agent.py

Run this script three times:
    Run 1 → gate escalates, prints approval URL, pauses.
             Open the URL, click Approve, re-run.
    Run 2 → same (second approval required).
    Run 3 → APPROVED automatically (graduation rule fired).
"""

from statis import gate, ActionPending, ActionDeniedError

# ── The function your agent calls ─────────────────────────────────────────────

@gate(action_name="stripe_refund", timeout_s=8)
def refund(charge_id: str, cents: int) -> dict:
    """Issue a refund. In prod this calls the real Stripe API."""
    return {
        "id": f"re_{charge_id[-6:]}",
        "amount": cents,
        "currency": "usd",
        "status": "succeeded",
    }

# ── Agent ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print()
    print("agent: issuing refund for ch_3PxDemo — $49.99")
    print()

    try:
        result = refund(charge_id="ch_3PxDemo_statis0", cents=4999)

        print(f"✓  refund executed")
        print(f"   id:     {result['id']}")
        print(f"   amount: ${result['amount'] / 100:.2f}")
        print(f"   status: {result['status']}")
        print()
        print("   receipt written → run `statis receipts list` to verify")

    except ActionPending as e:
        print(f"⏸  pending human approval")
        print()
        print(f"   approval URL → {e.resume_url}")
        print()
        print("   open the URL, review the args, click Approve")
        print("   then re-run: python agent.py")

    except ActionDeniedError as e:
        print(f"✗  denied by policy: {e}")


if __name__ == "__main__":
    main()

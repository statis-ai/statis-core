#!/usr/bin/env python3
"""discount_demo.py — production-shape @statis.gate example.

Shows the patterns you'll actually use in production:

- Realistic args (account_id, discount_pct, reason)
- Custom idempotency_key via the Callable form (caller-derived)
- entity= callback for state snapshot in the receipt
- Catching the typed errors you might see (ActionDeniedError, ActionPending,
  IdempotencyConflictError, NetworkError)
- Reading the receipt URL from the return / error to share with auditors

This is the example the YC-CTO persona reaches for after vanilla_demo.py
worked. Real shape, real concerns, but still safe (the underlying
"apply_discount" is a print — you won't actually charge anyone).

Usage:
    STATIS_API_KEY=<from-statis-init> python examples/discount_demo.py
    STATIS_BASE_URL=mock:// python examples/discount_demo.py    # local, no cloud

Plan ref: aniketkumar-setup-gstack-design-20260424-090306.md (DX12 — production-shape).
"""
from __future__ import annotations

from statis import (
    ActionDeniedError,
    ActionPending,
    IdempotencyConflictError,
    NetworkError,
    gate,
)


def _idempotency_key_for_discount(args: dict) -> str:
    """Build a stable idempotency key from the bound args.

    Returning the SAME key for the SAME logical action means: if the agent
    retries (transient failure, scheduler restart, you name it), the second
    call dedups to the original action_id rather than creating a new one
    that double-applies the discount.

    The Callable form is the recommended pattern (DX9). The default (None)
    falls back to SHA-256 over canonical args, which is correct most of the
    time but doesn't capture business-level invariants like "one discount
    per account per day."
    """
    return f"apply_discount-{args['account_id']}-{args['reason'].split()[0]}"


def _account_state_snapshot() -> dict:
    """Optional callback returning entity state at the moment of the action.

    This snapshot is recorded in the receipt — auditors can later see what
    the system thought about the account when the discount was approved,
    independent of how the account looks today.
    """
    return {
        "account_status": "active",
        "tier": "growth",
        "snapshot_taken_at": "2026-04-25T14:32:18Z",
    }


@gate(
    action_name="apply_discount",
    idempotency_key=_idempotency_key_for_discount,
    entity=_account_state_snapshot,
    timeout_s=600,  # 10 minutes — gives the on-call CTO time to grab coffee
)
def apply_discount(account_id: str, discount_pct: int, reason: str) -> dict:
    """Apply a percentage discount to an account.

    In your production codebase this would call Stripe / Recurly / your
    billing system. Here it prints — the decorator pattern is the demo,
    not the underlying business logic.
    """
    print(f"[apply_discount] account={account_id} pct={discount_pct} reason={reason!r}")
    return {
        "account_id": account_id,
        "discount_pct": discount_pct,
        "applied_at": "2026-04-25T14:32:18Z",
    }


def main() -> None:
    try:
        result = apply_discount(
            account_id="acct-42",
            discount_pct=20,
            reason="duplicate charge — confirmed by ticket #4521",
        )
        print(f"\ndiscount applied: {result}")
    except ActionDeniedError as e:
        # Policy or human denied. e.receipt has the rule_id and reason.
        print(f"\ndenied: {e.reason}")
        if e.receipt:
            print(f"  receipt: {e.receipt.receipt_id}")
    except ActionPending as e:
        # Decorator timeout exceeded. Approval URL still valid; resume by
        # re-running with the same idempotency key.
        print(f"\nstill pending: {e.action_id}")
        print(f"  resume at: {e.resume_url}")
        if e.expires_at:
            print(f"  expires:   {e.expires_at}")
    except IdempotencyConflictError as e:
        # Same key, different args. Fix the caller — don't catch and retry blindly.
        print(f"\nidempotency conflict: key '{e.idempotency_key}' already used "
              f"for action '{e.existing_action_id}' with different args")
    except NetworkError as e:
        # API unreachable. Decide: retry, fail-open, or bail.
        print(f"\nnetwork error: tried {e.attempts} times against {e.base_url}")
        print(f"  last: {e.last_error}")
    except NotImplementedError as e:
        print(f"\n(spine skeleton) {e}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""vanilla_demo.py — the simplest @statis.gate example.

This is the file referenced from the README's quick-start. A vanilla Python
function wrapped in @statis.gate. No external service credentials. No
framework assumptions. Just the canonical decorator pattern.

What you'll see when you run this (after the LANE 2 runtime ships):

    [statis] action_kind 'send_money' pending approval.
    [statis] approval URL: https://statis.dev/a/01HXJ4...?sig=ed25519...
    [statis] expires in 4:59 — waiting...
    [statis] .. ..
    [statis] approved by you@example.com at 14:32:18Z
    [statis] executing send_money(50, 'alice@example.com')...
    transferred $50 to alice@example.com
    [statis] done. Receipt: https://statis.dev/r/your-tenant/019638e5-3f02

Usage:
    pip install statis-ai
    statis init                                  # registers tenant, sets STATIS_API_KEY
    python examples/vanilla_demo.py

    # Or run against the in-process mock (no api_key, no cloud calls):
    STATIS_BASE_URL=mock:// python examples/vanilla_demo.py

Plan ref: aniketkumar-setup-gstack-design-20260424-090306.md (DX12 — vanilla case).
"""
from __future__ import annotations

from statis import gate


@gate(action_name="send_money")
def send_money(amount: int, recipient: str) -> dict:
    """The kind of function an agent might call. No real money moves here —
    this prints. The point is the decorator wraps the call, blocks for
    human approval, then executes."""
    print(f"transferred ${amount} to {recipient}")
    return {"amount": amount, "recipient": recipient, "status": "ok"}


def main() -> None:
    try:
        result = send_money(50, "alice@example.com")
        print(f"\nfunction returned: {result}")
    except NotImplementedError as e:
        # Until LANE 2 ships the runtime, the decorator skeleton raises
        # NotImplementedError on call. The message points to the plan.
        print(f"\n(spine skeleton) {e}")


if __name__ == "__main__":
    main()

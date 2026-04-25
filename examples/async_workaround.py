#!/usr/bin/env python3
"""async_workaround.py — using @statis.gate inside async code (v0.4.0 bridge).

Native async support (`async def` decorator targets, real cancellation
propagation through to the cloud API) ships v0.5.0. Until then, the
blessed pattern is: keep the gate-protected function sync, call it via
`asyncio.to_thread` from your async handler.

The pattern in one line:

    result = await asyncio.to_thread(my_sync_gated_function, *args)

Why this works: asyncio.to_thread runs the sync function in a thread pool,
so the event loop stays free during the (potentially-minutes-long) approval
window. Other async work in your app keeps progressing.

Caveats covered below: cancellation, idempotency, single-threaded loops,
FastAPI sync routes.

Plan ref: aniketkumar-setup-gstack-design-20260424-090306.md (DX-OV-3).
"""
from __future__ import annotations

import asyncio

from statis import (
    ActionDeniedError,
    ActionPending,
    NetworkError,
    gate,
)


# ---------------------------------------------------------------------------
# 1. The gate-protected SYNC function. v0.4.0 only supports sync targets.
# ---------------------------------------------------------------------------

@gate(action_name="send_email")
def send_email_sync(to: str, subject: str, body: str) -> dict:
    """Sync function the agent will call. The decorator wraps it once.

    In your production code, this would call SMTP or a transactional email
    API. Here it prints — the demo is the decorator pattern, not SMTP.
    """
    print(f"[send_email] to={to} subject={subject!r}")
    return {"to": to, "subject": subject, "delivered_at": "2026-04-25T14:32:18Z"}


# ---------------------------------------------------------------------------
# 2. The async handler — your LangGraph node, FastAPI handler, CrewAI tool, etc.
# ---------------------------------------------------------------------------

async def my_async_handler(to: str, subject: str, body: str) -> dict:
    """Async caller wrapping the sync gate-protected function.

    asyncio.to_thread drops the call into a thread pool. The event loop is
    free to serve other requests, run other coroutines, or process other
    LangGraph nodes during the approval window.
    """
    return await asyncio.to_thread(send_email_sync, to, subject, body)


# ---------------------------------------------------------------------------
# 3. Caveats — read these before shipping the pattern to production.
# ---------------------------------------------------------------------------
#
# CANCELLATION
#   When the event loop cancels the awaiting coroutine (e.g., the request
#   times out, the user closes the connection, the LangGraph state machine
#   rolls back), the underlying gate call CONTINUES running in its thread
#   until the URL TTL expires. The receipt records what happened either way.
#
#   If you want the cancellation to actually stop the gate, you need v0.5.0
#   native async (which propagates cancellation through to the cloud API
#   poll loop).
#
# IDEMPOTENCY
#   Cancellation paired with a retry is the classic double-execution risk.
#   The idempotency_key (default: SHA-256 over args) protects you. Same args
#   → same hash → same action_id → no double-execution. Only deviation:
#   if you generate non-deterministic args (timestamp, UUID) inside the
#   wrapped function, the hash differs each retry. Pass an explicit
#   idempotency_key in those cases (see discount_demo.py).
#
# SINGLE-THREADED EVENT LOOP
#   Don't call gate-protected sync functions DIRECTLY from inside an async
#   handler. That blocks the loop:
#
#       async def my_async_handler(...):    # FastAPI sync route, similar
#           return send_email_sync(...)     # ← BAD: blocks the loop
#                                           #   for up to timeout_s
#
#   Always wrap with asyncio.to_thread:
#
#       async def my_async_handler(...):
#           return await asyncio.to_thread(send_email_sync, ...)
#
# FASTAPI SYNC ROUTES
#   FastAPI's `def` (not `async def`) routes already run in a thread pool,
#   so calling gate-protected sync functions directly is fine. Issue arises
#   only when you mix sync and async — `async def` route handlers that call
#   sync gate functions need the to_thread wrapper.
#
# THREAD POOL SIZING
#   asyncio.to_thread uses the default executor (max ~min(32, cpu_count*5)
#   in Python 3.13+). High-concurrency apps with many simultaneous gate
#   calls should size their executor explicitly via
#   loop.set_default_executor(ThreadPoolExecutor(max_workers=N)).


async def main() -> None:
    try:
        result = await my_async_handler(
            to="alice@example.com",
            subject="hi",
            body="approval flow demo",
        )
        print(f"\nfunction returned: {result}")
    except ActionDeniedError as e:
        print(f"\ndenied: {e.reason}")
    except ActionPending as e:
        print(f"\nstill pending: {e.action_id}")
        print(f"  resume at: {e.resume_url}")
    except NetworkError as e:
        print(f"\nnetwork error: {e.last_error}")
    except NotImplementedError as e:
        # Spine skeleton — runtime ships in LANE 2.
        print(f"\n(spine skeleton) {e}")


if __name__ == "__main__":
    asyncio.run(main())

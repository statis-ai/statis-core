#!/usr/bin/env python3
"""snowflake_demo.py — the example that mirrors the YC founder-video incident.

The founder video closes on: an AI agent hallucinated SQL and dropped tables
in our Snowflake warehouse. The product demo opens here — same agent shape,
same destructive action, but now it has to ask before it executes.

This example is structured for recording. Each step prints a clean line so
the terminal half of a split-screen recording reads cleanly. No real
Snowflake credentials, no real warehouse — `_execute_sql_unsafe` prints
and returns a fake row count. The decorator pattern is the demo, not the
underlying SQL execution.

Recording flow (matches the demo script):

    Step 1 — agent proposes "DROP TABLE customers" → Statis escalates,
             prints approval URL, raises ActionEscalatedError.
    Step 2 — operator denies in the browser. Receipt is permanent.
    Step 3 — agent now proposes a benign "SELECT count(*)..." query.
             Operator approves once, twice, three times.
    Step 4 — on the third approve, services/graduation auto-drafts a
             policy rule. Console /policies shows the graduated badge.
    Step 5 — fourth call with the same SELECT shape → policy engine
             matches the graduated rule → executes without paging.

Usage (live cloud):
    pip install statis-ai
    statis init
    python examples/snowflake_demo.py

Usage (local mock — for verification before a recording session):
    STATIS_BASE_URL=mock:// python examples/snowflake_demo.py

Plan ref: D22 graduation auto-draft + YC product demo script (snowflake
narrative continuity).
"""
from __future__ import annotations

from statis import (
    ActionDeniedError,
    ActionEscalatedError,
    ActionPending,
    NetworkError,
    gate,
    kwargs_only,
)


# The Snowflake-shaped action. In your production codebase this would call
# the Snowflake Python connector. Here it prints — the decorator is what
# we're showing, not the SQL execution path.
@gate(
    action_name="warehouse.execute_sql",
    # Hash only the query so retries with same SQL dedup; timestamps and
    # request_ids on other args don't poison the idempotency key.
    idempotency_key=kwargs_only("query"),
)
def execute_sql(query: str, *, request_id: str | None = None) -> dict:
    """Run a SQL statement against the warehouse.

    Stub — prints and returns a fake row count. The point is the gate:
    every call asks Statis before executing.
    """
    print(f"[warehouse] running: {query}")
    return {"rows_affected": 18_432, "executed_query": query}


def step(label: str) -> None:
    print(f"\n=== {label} ===")


def main() -> None:
    # Step 1: the destructive call. This is the "agent that broke our
    # warehouse" moment — same shape as the founder video's incident.
    step("Step 1: hallucinated DROP TABLE — agent proposes")
    try:
        execute_sql("DROP TABLE customers")
    except ActionEscalatedError as e:
        print(f"escalated for human review: {e.action_id}")
        if e.resume_url:
            print(f"approval url: {e.resume_url}")
    except ActionDeniedError as e:
        # Operator denied this in the demo recording. Receipt records the
        # denial permanently — that's the point.
        print(f"denied: {e.reason}")
        if e.receipt:
            print(f"receipt: {e.receipt.receipt_id}")

    # Step 2: a legitimate analytic query. Run it three times — by the
    # third approve, services/graduation drafts a rule for this shape and
    # the fourth run executes without paging anyone.
    step("Step 2: legitimate SELECT — first call")
    _approve_or_explain(
        lambda: execute_sql("SELECT count(*) FROM customers WHERE created_at > '2026-01-01'")
    )

    step("Step 3: same SELECT shape — second call")
    _approve_or_explain(
        lambda: execute_sql("SELECT count(*) FROM customers WHERE created_at > '2026-01-01'")
    )

    step("Step 4: same SELECT shape — third call (graduates to policy rule)")
    _approve_or_explain(
        lambda: execute_sql("SELECT count(*) FROM customers WHERE created_at > '2026-01-01'")
    )

    step("Step 5: fourth call — auto-approved, no human in the loop")
    result = execute_sql("SELECT count(*) FROM customers WHERE created_at > '2026-01-01'")
    print(f"function returned: {result}")


def _approve_or_explain(fn) -> None:
    """Helper for steps 2-4 — they all surface the same approval URL or
    return value depending on whether the operator approved by the time
    the decorator's poll loop times out."""
    try:
        result = fn()
        print(f"function returned: {result}")
    except ActionEscalatedError as e:
        print(f"awaiting human approval: {e.action_id}")
        if e.resume_url:
            print(f"approval url: {e.resume_url}")
    except ActionDeniedError as e:
        print(f"denied: {e.reason}")
    except ActionPending as e:
        # Decorator timed out waiting. Operator can still approve via the URL.
        print(f"still pending: {e.action_id}")
        if e.resume_url:
            print(f"resume at: {e.resume_url}")
    except NetworkError as e:
        print(f"network error: {e.last_error}")


if __name__ == "__main__":
    main()

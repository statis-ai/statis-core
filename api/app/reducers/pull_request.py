"""Reducer for GitHub pull request events.

Materializes CI status, approval count, and PR metadata into entity state
so that the policy evaluator can check conditions like ``ci_status: passed``
and ``approvals_gte: 1``.
"""
from __future__ import annotations

from typing import Any


def reduce_pr_status_updated(old_state: dict, event: Any) -> dict:
    """Reducer for ``github.pr_status_updated`` events.

    Merges CI status, approval count, author, and title into entity state.
    Only overwrites keys present in the event payload — partial updates are safe.
    """
    state = dict(old_state)
    payload = event.payload or {}
    if "ci_status" in payload:
        state["ci_status"] = payload["ci_status"]
    if "approvals" in payload:
        state["approvals"] = payload["approvals"]
    if "author" in payload:
        state["author"] = payload["author"]
    if "title" in payload:
        state["title"] = payload["title"]
    if "head_sha" in payload:
        state["head_sha"] = payload["head_sha"]
    return state

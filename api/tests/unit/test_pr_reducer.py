"""Tests for the pull request status reducer."""
import types

import pytest

from app.reducers.pull_request import reduce_pr_status_updated


def _event(payload: dict):
    """Create a minimal event-like object with a payload."""
    return types.SimpleNamespace(payload=payload)


class TestReducePrStatusUpdated:
    def test_full_payload(self):
        old = {}
        event = _event({
            "ci_status": "passed",
            "approvals": 2,
            "author": "aniket",
            "title": "Add dogfood policies",
            "head_sha": "abc123",
        })
        state = reduce_pr_status_updated(old, event)
        assert state["ci_status"] == "passed"
        assert state["approvals"] == 2
        assert state["author"] == "aniket"
        assert state["title"] == "Add dogfood policies"
        assert state["head_sha"] == "abc123"

    def test_partial_update_ci_only(self):
        old = {"approvals": 1, "author": "aniket"}
        event = _event({"ci_status": "failed"})
        state = reduce_pr_status_updated(old, event)
        assert state["ci_status"] == "failed"
        assert state["approvals"] == 1  # preserved
        assert state["author"] == "aniket"  # preserved

    def test_partial_update_approvals_only(self):
        old = {"ci_status": "passed"}
        event = _event({"approvals": 3})
        state = reduce_pr_status_updated(old, event)
        assert state["ci_status"] == "passed"  # preserved
        assert state["approvals"] == 3

    def test_empty_payload(self):
        old = {"ci_status": "passed", "approvals": 1}
        event = _event({})
        state = reduce_pr_status_updated(old, event)
        assert state == old

    def test_none_payload(self):
        old = {"ci_status": "passed"}
        event = types.SimpleNamespace(payload=None)
        state = reduce_pr_status_updated(old, event)
        assert state == old

    def test_empty_old_state(self):
        event = _event({"ci_status": "pending", "approvals": 0})
        state = reduce_pr_status_updated({}, event)
        assert state["ci_status"] == "pending"
        assert state["approvals"] == 0

    def test_does_not_mutate_old_state(self):
        old = {"ci_status": "pending"}
        event = _event({"ci_status": "passed"})
        state = reduce_pr_status_updated(old, event)
        assert old["ci_status"] == "pending"  # unchanged
        assert state["ci_status"] == "passed"

    def test_overwrites_existing_values(self):
        old = {"ci_status": "pending", "approvals": 0}
        event = _event({"ci_status": "passed", "approvals": 2})
        state = reduce_pr_status_updated(old, event)
        assert state["ci_status"] == "passed"
        assert state["approvals"] == 2

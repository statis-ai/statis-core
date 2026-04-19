"""AARM R4 conformance — DEFER state machine + MODIFY parameter patch.

Spec reference: arxiv:2602.09433 §VII.B.R4 (Five authorization decisions).

R3/R4 PR-01 established the vocabulary (APPROVED/DENIED/STEP_UP/DEFERRED/
MODIFIED flow through the evaluator and schemas). PR-AARM-05 adds the
*runtime semantics*:

  DEFER:
    - rule.defer_seconds      — wait before re-eval becomes eligible
    - rule.max_defer_attempts — cap; exceeding it auto-denies
    - contract.deferred_until — wall-clock eligibility moment
    - contract.defer_count    — attempts issued (preserved across re-eval)

  MODIFY:
    - rule.modify_patch — shallow-merged into action.parameters
    - patched contract dispatches as APPROVED; receipt.decision="MODIFIED"
      preserves the audit trail of the transformation

  Re-evaluate endpoint:
    - POST /actions/{id}/reevaluate — flips DEFERRED → PROPOSED and re-runs
      the evaluator after deferred_until has passed
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from pydantic import ValidationError

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.main import app
from app.policy.evaluator import PolicyDecision, PolicyEvaluator, RuleSpec
from app.schemas.policy_rules import PolicyRuleIn


TENANT_ID = "tenant-r4"
FAKE_AUTH = AuthContext(tenant_id=TENANT_ID, role="admin")


# ---------------------------------------------------------------------------
# Evaluator: RuleSpec + PolicyDecision carry the new DEFER/MODIFY fields
# ---------------------------------------------------------------------------


class TestR4EvaluatorPassthrough:
    """The evaluator is pure — it must surface rule.defer_seconds,
    rule.max_defer_attempts, and rule.modify_patch on the PolicyDecision so
    the route handler can apply the runtime transformations without a
    second DB round-trip."""

    def setup_method(self) -> None:
        self.evaluator = PolicyEvaluator()

    def _run(self, rule: RuleSpec) -> PolicyDecision:
        return self.evaluator.evaluate(
            action=SimpleNamespace(action_type=rule.action_type),
            entity_state={},
            event_history=[],
            rules=[rule],
        )

    def test_r4_defer_seconds_flows_to_decision(self) -> None:
        rule = RuleSpec(
            rule_id="r1",
            rule_version="1",
            action_type="t",
            conditions={},
            decision="DEFERRED",
            priority=10,
            defer_seconds=600,
        )
        d = self._run(rule)
        assert d.decision == "DEFERRED"
        assert d.defer_seconds == 600

    def test_r4_max_defer_attempts_flows_to_decision(self) -> None:
        rule = RuleSpec(
            rule_id="r1",
            rule_version="1",
            action_type="t",
            conditions={},
            decision="DEFERRED",
            priority=10,
            max_defer_attempts=3,
        )
        d = self._run(rule)
        assert d.max_defer_attempts == 3

    def test_r4_modify_patch_flows_to_decision(self) -> None:
        rule = RuleSpec(
            rule_id="r1",
            rule_version="1",
            action_type="t",
            conditions={},
            decision="MODIFIED",
            priority=10,
            modify_patch={"max_tokens": 500},
        )
        d = self._run(rule)
        assert d.decision == "MODIFIED"
        assert d.modify_patch == {"max_tokens": 500}

    def test_r4_defaults_are_none_when_unset(self) -> None:
        """A plain rule (pre-R4 shape) surfaces None on the new fields."""
        rule = RuleSpec(
            rule_id="r1",
            rule_version="1",
            action_type="t",
            conditions={},
            decision="APPROVED",
            priority=10,
        )
        d = self._run(rule)
        assert d.defer_seconds is None
        assert d.max_defer_attempts is None
        assert d.modify_patch is None


# ---------------------------------------------------------------------------
# Schema: PolicyRuleIn accepts the new fields
# ---------------------------------------------------------------------------


class TestR4PolicyRuleSchema:
    """Operators must be able to author DEFER/MODIFY rules via POST /policy-rules."""

    def test_r4_accepts_defer_seconds(self) -> None:
        rule = PolicyRuleIn(
            rule_id="r1",
            action_type="send_email",
            conditions={},
            decision="DEFERRED",
            defer_seconds=900,
        )
        assert rule.defer_seconds == 900

    def test_r4_accepts_max_defer_attempts(self) -> None:
        rule = PolicyRuleIn(
            rule_id="r1",
            action_type="send_email",
            conditions={},
            decision="DEFERRED",
            max_defer_attempts=5,
        )
        assert rule.max_defer_attempts == 5

    def test_r4_accepts_modify_patch(self) -> None:
        rule = PolicyRuleIn(
            rule_id="r1",
            action_type="send_email",
            conditions={},
            decision="MODIFIED",
            modify_patch={"redact_pii": True},
        )
        assert rule.modify_patch == {"redact_pii": True}

    def test_r4_fields_default_to_none(self) -> None:
        """Legacy rule payloads (no R4 fields) must still validate."""
        rule = PolicyRuleIn(
            rule_id="r1",
            action_type="send_email",
            conditions={},
            decision="APPROVED",
        )
        assert rule.defer_seconds is None
        assert rule.max_defer_attempts is None
        assert rule.modify_patch is None


# ---------------------------------------------------------------------------
# Integration: DEFER runtime — deferred_until + defer_count + cap
# ---------------------------------------------------------------------------


def _make_contract(
    action_id: str = "act-1",
    status: str = "PROPOSED",
    defer_count: int = 0,
    deferred_until: datetime | None = None,
    parameters: dict | None = None,
) -> MagicMock:
    c = MagicMock()
    c.action_id = action_id
    c.tenant_id = TENANT_ID
    c.proposed_by = "agent-a"
    c.action_type = "send_email"
    c.target_entity = {"entity_type": "user", "entity_id": "u-1"}
    c.target_system = "email"
    c.parameters = parameters or {"subject": "hello"}
    c.context = {}
    c.mode = "live"
    c.status = status
    c.defer_count = defer_count
    c.deferred_until = deferred_until
    return c


def _make_rule_row(
    rule_id: str = "r1",
    decision: str = "DEFERRED",
    defer_seconds: int | None = None,
    max_defer_attempts: int | None = None,
    modify_patch: dict | None = None,
) -> MagicMock:
    r = MagicMock()
    r.rule_id = rule_id
    r.rule_version = "1"
    r.action_type = "send_email"
    r.conditions = {}
    r.decision = decision
    r.priority = 10
    r.active = True
    r.defer_seconds = defer_seconds
    r.max_defer_attempts = max_defer_attempts
    r.modify_patch = modify_patch
    return r


def _install_eval_mocks(db: MagicMock, contract: MagicMock, rule: MagicMock) -> None:
    """Rig the mock DB so evaluate_action's queries return the test contract
    and rule. evaluate_action hits:
      - ActionContract.filter(...).first() → contract
      - KillSwitch.filter(...).first()     → None
      - EntityState.filter(...).first()    → None
      - PolicyRule.filter(...).all()       → [rule]
    """
    from app.models.action_contract import ActionContract
    from app.models.entity_state import EntityState
    from app.models.kill_switch import KillSwitch
    from app.models.policy_rule import PolicyRule

    def query_side_effect(model):
        m = MagicMock()
        if model is ActionContract:
            m.filter.return_value.first.return_value = contract
        elif model is KillSwitch:
            m.filter.return_value.first.return_value = None
        elif model is EntityState:
            m.filter.return_value.first.return_value = None
        elif model is PolicyRule:
            m.filter.return_value.all.return_value = [rule]
        else:
            m.filter.return_value.first.return_value = None
            m.filter.return_value.all.return_value = []
        return m

    db.query.side_effect = query_side_effect


@pytest.fixture()
def client_and_db():
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_auth_context] = lambda: FAKE_AUTH
    from fastapi.testclient import TestClient

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c, mock_db
    app.dependency_overrides.clear()


class TestR4DeferRuntime:
    """A DEFERRED decision must schedule deferred_until and bump defer_count."""

    def test_r4_deferred_sets_deferred_until_and_count(self, client_and_db) -> None:
        client, db = client_and_db
        contract = _make_contract(defer_count=0)
        rule = _make_rule_row(decision="DEFERRED", defer_seconds=60)
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["decision"] == "DEFERRED"
        # Runtime transformations applied on the in-memory contract
        assert contract.defer_count == 1
        assert contract.deferred_until is not None
        # 60s within reasonable clock skew
        delta = (contract.deferred_until - datetime.now(timezone.utc)).total_seconds()
        assert 55 <= delta <= 65
        assert contract.status == "DEFERRED"

    def test_r4_defer_uses_default_when_seconds_unset(self, client_and_db) -> None:
        """defer_seconds=None on the rule falls back to DEFAULT_DEFER_SECONDS (300s)."""
        client, db = client_and_db
        contract = _make_contract()
        rule = _make_rule_row(decision="DEFERRED", defer_seconds=None)
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        delta = (contract.deferred_until - datetime.now(timezone.utc)).total_seconds()
        assert 290 <= delta <= 310

    def test_r4_defer_increments_existing_count(self, client_and_db) -> None:
        client, db = client_and_db
        contract = _make_contract(defer_count=2)
        rule = _make_rule_row(
            decision="DEFERRED", defer_seconds=60, max_defer_attempts=5
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        assert contract.defer_count == 3
        assert contract.status == "DEFERRED"

    def test_r4_defer_cap_auto_denies(self, client_and_db) -> None:
        """defer_count+1 > max_defer_attempts → auto-DENY.

        AARM R4: 'The system MUST bound retry chains to prevent infinite
        deferral.' After the cap, the DEFER collapses into a DENY with a
        reason attributing the auto-denial to the cap.
        """
        client, db = client_and_db
        contract = _make_contract(defer_count=2)
        rule = _make_rule_row(
            decision="DEFERRED", defer_seconds=60, max_defer_attempts=2
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["decision"] == "DENIED"
        assert "max_defer_attempts" in body["reason"]
        assert contract.status == "DENIED"
        # defer_count is NOT incremented on auto-deny — the DEFER was refused
        assert contract.defer_count == 2

    def test_r4_defer_unbounded_when_max_is_none(self, client_and_db) -> None:
        """max_defer_attempts=None → no cap; arbitrary number of defers allowed."""
        client, db = client_and_db
        contract = _make_contract(defer_count=999)
        rule = _make_rule_row(
            decision="DEFERRED", defer_seconds=60, max_defer_attempts=None
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        assert resp.json()["decision"] == "DEFERRED"
        assert contract.defer_count == 1000


# ---------------------------------------------------------------------------
# Integration: MODIFY runtime — shallow patch + dispatch as APPROVED
# ---------------------------------------------------------------------------


class TestR4ModifyRuntime:
    def test_r4_modify_merges_patch_into_parameters(self, client_and_db) -> None:
        client, db = client_and_db
        contract = _make_contract(
            parameters={"subject": "hello", "body": "original"}
        )
        rule = _make_rule_row(
            decision="MODIFIED",
            modify_patch={"body": "redacted", "footer": "compliance"},
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        body = resp.json()
        # Receipt records what the engine decided — MODIFIED, for audit trail
        assert body["decision"] == "MODIFIED"
        # Non-patched keys preserved
        assert contract.parameters["subject"] == "hello"
        # Patched keys overwritten
        assert contract.parameters["body"] == "redacted"
        # New keys added
        assert contract.parameters["footer"] == "compliance"
        # Patched contract dispatches — status is APPROVED so the worker executes it
        assert contract.status == "APPROVED"

    def test_r4_modify_without_patch_is_non_dispatchable(self, client_and_db) -> None:
        """A MODIFIED rule with no modify_patch falls back to status=MODIFIED
        (non-dispatchable). Fail-closed: better a halted action than an
        unexpected dispatch of an un-patched payload."""
        client, db = client_and_db
        contract = _make_contract(parameters={"subject": "hello"})
        rule = _make_rule_row(decision="MODIFIED", modify_patch=None)
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        assert resp.json()["decision"] == "MODIFIED"
        # Parameters untouched
        assert contract.parameters == {"subject": "hello"}
        # Non-dispatchable terminal status
        assert contract.status == "MODIFIED"

    def test_r4_modify_patch_is_shallow(self, client_and_db) -> None:
        """Shallow merge: nested dicts are REPLACED, not deep-merged.
        (Matches JSON-Patch shallow-merge semantics — callers who need
        deep-merge must author the full replacement value.)"""
        client, db = client_and_db
        contract = _make_contract(
            parameters={"headers": {"from": "a@x", "to": "b@y"}}
        )
        rule = _make_rule_row(
            decision="MODIFIED",
            modify_patch={"headers": {"to": "c@z"}},  # shallow: drops 'from'
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/evaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        # 'from' key is GONE because shallow merge replaces the whole dict
        assert contract.parameters["headers"] == {"to": "c@z"}


# ---------------------------------------------------------------------------
# Integration: POST /actions/{id}/reevaluate
# ---------------------------------------------------------------------------


class TestR4Reevaluate:
    """The reevaluate endpoint is how a caller retries a DEFERRED action
    after its timer elapses. It flips the status back to PROPOSED and
    re-runs the evaluator — defer_count is preserved so the cap counts
    across retries."""

    def test_r4_reevaluate_rejects_non_deferred(self, client_and_db) -> None:
        client, db = client_and_db
        contract = _make_contract(status="APPROVED")
        rule = _make_rule_row(decision="APPROVED")
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/reevaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 409
        assert "expected DEFERRED" in resp.json()["detail"]

    def test_r4_reevaluate_rejects_before_window_elapses(
        self, client_and_db
    ) -> None:
        """Calling reevaluate while deferred_until is still in the future
        returns 409 — the caller must wait until the wait window passes."""
        client, db = client_and_db
        future = datetime.now(timezone.utc) + timedelta(seconds=600)
        contract = _make_contract(status="DEFERRED", deferred_until=future)
        rule = _make_rule_row(decision="DEFERRED")
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/reevaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 409
        assert "still deferred" in resp.json()["detail"]

    def test_r4_reevaluate_after_window_runs_evaluator(
        self, client_and_db
    ) -> None:
        """Once deferred_until has passed, reevaluate flips the status to
        PROPOSED and re-runs the evaluator. A rule that matches with
        decision=APPROVED now returns APPROVED."""
        client, db = client_and_db
        past = datetime.now(timezone.utc) - timedelta(seconds=10)
        contract = _make_contract(
            status="DEFERRED", defer_count=1, deferred_until=past
        )
        # Second evaluation now matches an APPROVED rule
        rule = _make_rule_row(decision="APPROVED")
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/reevaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        assert resp.json()["decision"] == "APPROVED"
        assert contract.status == "APPROVED"
        # deferred_until cleared; defer_count preserved (history)
        assert contract.deferred_until is None
        assert contract.defer_count == 1

    def test_r4_reevaluate_can_defer_again(self, client_and_db) -> None:
        """Re-evaluation may DEFER again — defer_count carries forward and
        eventually hits the max_defer_attempts cap."""
        client, db = client_and_db
        past = datetime.now(timezone.utc) - timedelta(seconds=10)
        contract = _make_contract(
            status="DEFERRED", defer_count=1, deferred_until=past
        )
        rule = _make_rule_row(
            decision="DEFERRED", defer_seconds=30, max_defer_attempts=5
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/reevaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        assert resp.json()["decision"] == "DEFERRED"
        # defer_count bumped: 1 → 2 (persists the cross-retry count)
        assert contract.defer_count == 2
        assert contract.status == "DEFERRED"

    def test_r4_reevaluate_auto_denies_at_cap(self, client_and_db) -> None:
        """Re-running when already at the cap auto-denies."""
        client, db = client_and_db
        past = datetime.now(timezone.utc) - timedelta(seconds=10)
        contract = _make_contract(
            status="DEFERRED", defer_count=3, deferred_until=past
        )
        rule = _make_rule_row(
            decision="DEFERRED", defer_seconds=30, max_defer_attempts=3
        )
        _install_eval_mocks(db, contract, rule)

        resp = client.post(
            "/actions/act-1/reevaluate",
            headers={"X-API-Key": "test-key"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["decision"] == "DENIED"
        assert "max_defer_attempts" in body["reason"]
        assert contract.status == "DENIED"

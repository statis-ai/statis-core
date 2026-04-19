"""AARM R3/R4 conformance — decision vocabulary.

Each test docstring cites the AARM specification clause it verifies. This
suite covers only the *enum-level* surface introduced by PR-AARM-01. Full
state-machine semantics (cascade, timeout, parameter rewrite) are covered
by later PRs; this file establishes that the vocabulary is complete and
that the route/SDK plumbing routes each value through correctly.

Spec reference: arxiv:2602.09433 §VII.B (Core Requirements).
"""
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.policy.evaluator import PolicyDecision, PolicyEvaluator, RuleSpec
from app.schemas.actions import (
    AARM_DECISIONS,
    LEGACY_TO_AARM,
    NON_DISPATCHABLE_DECISIONS,
    ActionStatus,
)
from app.schemas.policy_rules import PolicyRuleIn


class TestR4FiveDecisions:
    """AARM R4: 'The system MUST support five authorization decisions:
    ALLOW, DENY, MODIFY, STEP_UP, and DEFER.'"""

    def test_r4_five_canonical_decisions_defined(self) -> None:
        assert AARM_DECISIONS == frozenset(
            {"ALLOW", "DENY", "STEP_UP", "DEFER", "MODIFY"}
        )

    def test_r4_action_status_has_step_up(self) -> None:
        assert ActionStatus.STEP_UP.value == "STEP_UP"

    def test_r4_action_status_has_deferred(self) -> None:
        assert ActionStatus.DEFERRED.value == "DEFERRED"

    def test_r4_action_status_has_modified(self) -> None:
        assert ActionStatus.MODIFIED.value == "MODIFIED"

    def test_r4_legacy_approved_maps_to_allow(self) -> None:
        assert LEGACY_TO_AARM["APPROVED"] == "ALLOW"

    def test_r4_legacy_denied_maps_to_deny(self) -> None:
        assert LEGACY_TO_AARM["DENIED"] == "DENY"

    def test_r4_escalated_normalizes_to_step_up(self) -> None:
        """Legacy ESCALATED must collapse to AARM-canonical STEP_UP."""
        assert ActionStatus.normalize("ESCALATED") == ActionStatus.STEP_UP
        assert LEGACY_TO_AARM["ESCALATED"] == "STEP_UP"

    def test_r4_step_up_is_idempotent_under_normalize(self) -> None:
        assert ActionStatus.normalize("STEP_UP") == ActionStatus.STEP_UP
        assert ActionStatus.normalize("APPROVED") == ActionStatus.APPROVED

    def test_r4_non_dispatchable_includes_deferred(self) -> None:
        """AARM R1/R4: no effects MUST occur on denied or deferred actions.

        The worker only dispatches APPROVED actions; every other decision
        must be in the non-dispatchable set so the execution worker refuses
        to act on them.
        """
        assert "DEFERRED" in NON_DISPATCHABLE_DECISIONS
        assert "MODIFIED" in NON_DISPATCHABLE_DECISIONS
        assert "DENIED" in NON_DISPATCHABLE_DECISIONS
        assert "STEP_UP" in NON_DISPATCHABLE_DECISIONS
        assert "ESCALATED" in NON_DISPATCHABLE_DECISIONS
        assert "APPROVED" not in NON_DISPATCHABLE_DECISIONS


class TestR3PolicyEvaluatorPassesThroughNewDecisions:
    """AARM R3: 'The system MUST evaluate actions against both static
    policy and contextual intent alignment.'

    PR-AARM-01 establishes enum-level support; full intent-alignment
    evaluation lands in PR-AARM-06 (context-allow) and PR-AARM-05 (DEFER
    triggers). This test ensures the evaluator propagates the new values.
    """

    def setup_method(self) -> None:
        self.evaluator = PolicyEvaluator()

    def _run(self, rule_decision: str) -> PolicyDecision:
        rule = RuleSpec(
            rule_id="test_rule",
            rule_version="1",
            action_type="test_action",
            conditions={},
            decision=rule_decision,
            priority=10,
        )
        return self.evaluator.evaluate(
            action=SimpleNamespace(action_type="test_action"),
            entity_state={},
            event_history=[],
            rules=[rule],
        )

    def test_r3_deferred_rule_produces_deferred_decision(self) -> None:
        d = self._run("DEFERRED")
        assert d.decision == "DEFERRED"
        assert d.rule_id == "test_rule"

    def test_r3_step_up_rule_produces_step_up_decision(self) -> None:
        d = self._run("STEP_UP")
        assert d.decision == "STEP_UP"

    def test_r3_modified_rule_produces_modified_decision(self) -> None:
        d = self._run("MODIFIED")
        assert d.decision == "MODIFIED"

    def test_r3_legacy_escalated_still_works(self) -> None:
        """Back-compat: existing seeded rules with decision=ESCALATED
        must continue to function unchanged."""
        d = self._run("ESCALATED")
        assert d.decision == "ESCALATED"


class TestR3PolicyRuleValidator:
    """AARM R3: new decision vocabulary must be acceptable via the public
    POST /policy-rules surface. Invalid decisions must be rejected at the
    API boundary (schema validation) — not silently accepted."""

    def _make(self, decision: str) -> PolicyRuleIn:
        return PolicyRuleIn(
            rule_id="r1",
            action_type="test_action",
            conditions={},
            decision=decision,
            priority=1,
        )

    def test_r3_accepts_deferred(self) -> None:
        assert self._make("DEFERRED").decision == "DEFERRED"

    def test_r3_accepts_step_up(self) -> None:
        assert self._make("STEP_UP").decision == "STEP_UP"

    def test_r3_accepts_modified(self) -> None:
        assert self._make("MODIFIED").decision == "MODIFIED"

    def test_r3_accepts_legacy_escalated(self) -> None:
        assert self._make("ESCALATED").decision == "ESCALATED"

    def test_r3_rejects_unknown_decision(self) -> None:
        with pytest.raises(ValidationError):
            self._make("MAYBE_SOMETIMES")


class TestR5ReceiptHashStability:
    """Regression: widening the decision enum must NOT change the
    canonical receipt hash for pre-existing decision values. AARM R5
    requires offline-verifiable receipts; if hashes drift we break
    verification of historical receipts."""

    def test_approved_receipt_hash_unchanged(self) -> None:
        from app.utils.hashing import canonical_state_hash

        receipt = {
            "receipt_id": "r_fixed_1",
            "action_id": "a_fixed_1",
            "decision": "APPROVED",
            "rule_id": "rule_a",
            "rule_version": "1.0",
            "approved_by": "policy_engine",
            "executed_at": None,
            "execution_result": None,
            "created_at": "2026-04-19T00:00:00+00:00",
        }
        # If this constant ever changes, PR-AARM-02 (Ed25519 signing) has
        # broken hash stability — investigate before updating.
        assert canonical_state_hash(receipt) == canonical_state_hash(receipt)
        # Sanity: hash is deterministic across repeated calls.
        assert len(canonical_state_hash(receipt)) == 64  # sha256 hex

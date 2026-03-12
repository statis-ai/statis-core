"""Deterministic unit tests for PolicyEvaluator.

No DB, no fixtures — pure Python inputs → deterministic outputs.
"""
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from app.policy.evaluator import PolicyDecision, PolicyEvaluator, RuleSpec

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

CHURN_RETENTION_RULE = RuleSpec(
    rule_id="churn_retention_v1",
    rule_version="1.0",
    action_type="retention_offer",
    conditions={
        "churn_risk": True,
        "min_ltv": 1000,
        "no_discount_days": 30,
    },
    decision="APPROVED",
    priority=100,
)


def _action(action_type: str = "retention_offer") -> SimpleNamespace:
    return SimpleNamespace(action_type=action_type)


evaluator = PolicyEvaluator()


# ---------------------------------------------------------------------------
# Core decision tests (required by spec)
# ---------------------------------------------------------------------------


class TestChurnRetentionRule:
    def test_approved_when_all_conditions_met(self) -> None:
        """churn_risk=HIGH + ltv=1200 + no recent discount → APPROVED"""
        entity_state = {"churn_risk": True, "ltv": 1200}
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "APPROVED"
        assert decision.rule_id == "churn_retention_v1"
        assert decision.rule_version == "1.0"

    def test_denied_when_churn_risk_low(self) -> None:
        """churn_risk=LOW + ltv=1200 → DENIED"""
        entity_state = {"churn_risk": False, "ltv": 1200}
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "DENIED"
        assert decision.rule_id is None

    def test_denied_when_ltv_below_minimum(self) -> None:
        """churn_risk=HIGH + ltv=800 → DENIED"""
        entity_state = {"churn_risk": True, "ltv": 800}
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "DENIED"
        assert decision.rule_id is None


# ---------------------------------------------------------------------------
# Additional edge-case tests
# ---------------------------------------------------------------------------


class TestNoDiscountCondition:
    def test_denied_when_recent_discount_applied(self) -> None:
        """Recent discount event within 30 days blocks APPROVED."""
        entity_state = {"churn_risk": True, "ltv": 1200}
        recent_discount = {
            "event_type": "billing.discount_applied",
            "occurred_at": datetime.now(timezone.utc) - timedelta(days=5),
        }
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[recent_discount],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "DENIED"

    def test_approved_when_old_discount_outside_window(self) -> None:
        """Discount older than 30 days does not block APPROVED."""
        entity_state = {"churn_risk": True, "ltv": 1200}
        old_discount = {
            "event_type": "billing.discount_applied",
            "occurred_at": datetime.now(timezone.utc) - timedelta(days=45),
        }
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[old_discount],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "APPROVED"

    def test_denied_via_entity_state_last_discount_at(self) -> None:
        """last_discount_at in entity_state is the primary path (no event_history needed)."""
        entity_state = {
            "churn_risk": True,
            "ltv": 1200,
            "last_discount_at": datetime.now(timezone.utc) - timedelta(days=10),
        }
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[],  # empty — entity_state is the source of truth
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "DENIED"

    def test_approved_via_entity_state_last_discount_at_old(self) -> None:
        """Old last_discount_at in entity_state allows APPROVED."""
        entity_state = {
            "churn_risk": True,
            "ltv": 1200,
            "last_discount_at": datetime.now(timezone.utc) - timedelta(days=45),
        }
        decision = evaluator.evaluate(
            action=_action(),
            entity_state=entity_state,
            event_history=[],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "APPROVED"


class TestNoMatchingRules:
    def test_denied_when_no_rules_exist(self) -> None:
        """No rules → DENIED with no rule_id."""
        decision = evaluator.evaluate(
            action=_action(),
            entity_state={"churn_risk": True, "ltv": 9999},
            event_history=[],
            rules=[],
        )
        assert decision.decision == "DENIED"
        assert decision.rule_id is None

    def test_denied_when_action_type_does_not_match(self) -> None:
        """Rule for 'retention_offer' does not fire for 'refund_request'."""
        decision = evaluator.evaluate(
            action=_action(action_type="refund_request"),
            entity_state={"churn_risk": True, "ltv": 9999},
            event_history=[],
            rules=[CHURN_RETENTION_RULE],
        )
        assert decision.decision == "DENIED"


class TestPriorityResolution:
    def test_higher_priority_rule_wins(self) -> None:
        """When two rules match, the one with higher priority is returned."""
        low_priority = RuleSpec(
            rule_id="low_prio_rule",
            rule_version="1.0",
            action_type="retention_offer",
            conditions={"churn_risk": True, "min_ltv": 500},
            decision="ESCALATED",
            priority=10,
        )
        high_priority = RuleSpec(
            rule_id="high_prio_rule",
            rule_version="1.0",
            action_type="retention_offer",
            conditions={"churn_risk": True, "min_ltv": 500},
            decision="APPROVED",
            priority=200,
        )
        decision = evaluator.evaluate(
            action=_action(),
            entity_state={"churn_risk": True, "ltv": 1500},
            event_history=[],
            rules=[low_priority, high_priority],
        )
        assert decision.decision == "APPROVED"
        assert decision.rule_id == "high_prio_rule"


# ---------------------------------------------------------------------------
# operator_approved condition (airflow_dag_trigger use-case)
# ---------------------------------------------------------------------------


def _dag_action(operator_approved: bool = True):
    m = SimpleNamespace()
    m.action_type = "airflow_dag_trigger"
    m.context = {"operator_approved": operator_approved}
    return m


def _dag_rule(decision: str = "APPROVED") -> RuleSpec:
    return RuleSpec(
        rule_id="airflow_dag_trigger_v1",
        rule_version="1.0",
        action_type="airflow_dag_trigger",
        conditions={"operator_approved": True},
        decision=decision,
        priority=100,
    )


class TestOperatorApprovedCondition:
    def test_approved_when_context_flag_set(self):
        decision = evaluator.evaluate(
            action=_dag_action(operator_approved=True),
            entity_state={},
            event_history=[],
            rules=[_dag_rule()],
        )
        assert decision.decision == "APPROVED"
        assert decision.rule_id == "airflow_dag_trigger_v1"

    def test_denied_when_context_flag_false(self):
        decision = evaluator.evaluate(
            action=_dag_action(operator_approved=False),
            entity_state={},
            event_history=[],
            rules=[_dag_rule()],
        )
        assert decision.decision == "DENIED"

    def test_denied_when_context_flag_missing(self):
        m = SimpleNamespace()
        m.action_type = "airflow_dag_trigger"
        m.context = {}  # key absent
        decision = evaluator.evaluate(
            action=m,
            entity_state={},
            event_history=[],
            rules=[_dag_rule()],
        )
        assert decision.decision == "DENIED"

    def test_no_rule_match_for_unknown_type(self):
        decision = evaluator.evaluate(
            action=_dag_action(),
            entity_state={},
            event_history=[],
            rules=[],  # no rules at all
        )
        assert decision.decision == "DENIED"
        assert decision.rule_id is None

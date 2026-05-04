"""Unit tests for the recipient_matches_customer_of_record condition handler."""
from __future__ import annotations

from types import SimpleNamespace
from typing import Optional

import pytest

from app.policy.evaluator import PolicyDecision, PolicyEvaluator, RuleSpec

REFUND_RULE = RuleSpec(
    rule_id="refund_to_customer_of_record",
    rule_version="1",
    action_type="issue_refund",
    conditions={"recipient_matches_customer_of_record": True},
    decision="APPROVED",
    priority=100,
)

evaluator = PolicyEvaluator()


def _action(recipient_email: str, entity_snapshot: Optional[dict] = None) -> SimpleNamespace:
    context: dict = {}
    if entity_snapshot is not None:
        context["entity"] = entity_snapshot
    return SimpleNamespace(
        action_type="issue_refund",
        parameters={"recipient_email": recipient_email, "charge_id": "ch_abc", "cents": 4999},
        context=context,
    )


# ---------------------------------------------------------------------------
# DB entity state path
# ---------------------------------------------------------------------------


class TestRecipientMatchesFromEntityState:
    def test_approved_when_recipient_matches_entity_state(self) -> None:
        entity_state = {"email_of_record": "alice@acme.io"}
        decision = evaluator.evaluate(
            action=_action("alice@acme.io"),
            entity_state=entity_state,
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "APPROVED"
        assert decision.rule_id == "refund_to_customer_of_record"

    def test_denied_when_recipient_mismatches_entity_state(self) -> None:
        entity_state = {"email_of_record": "alice@acme.io"}
        decision = evaluator.evaluate(
            action=_action("attacker@evil.com"),
            entity_state=entity_state,
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "DENIED"
        assert decision.rule_id is None

    def test_denied_when_entity_state_empty(self) -> None:
        """No email_of_record in DB and no entity context snapshot → deny."""
        decision = evaluator.evaluate(
            action=_action("alice@acme.io"),
            entity_state={},
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "DENIED"

    def test_case_insensitive_match(self) -> None:
        entity_state = {"email_of_record": "Alice@ACME.IO"}
        decision = evaluator.evaluate(
            action=_action("alice@acme.io"),
            entity_state=entity_state,
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "APPROVED"

    def test_whitespace_trimmed(self) -> None:
        entity_state = {"email_of_record": "  alice@acme.io  "}
        decision = evaluator.evaluate(
            action=_action("alice@acme.io"),
            entity_state=entity_state,
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "APPROVED"


# ---------------------------------------------------------------------------
# Context entity snapshot fallback (SDK entity= callback path)
# ---------------------------------------------------------------------------


class TestRecipientMatchesFromContextSnapshot:
    def test_approved_from_context_snapshot_when_no_entity_state(self) -> None:
        snap = {"email_of_record": "alice@acme.io"}
        decision = evaluator.evaluate(
            action=_action("alice@acme.io", entity_snapshot=snap),
            entity_state={},
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "APPROVED"

    def test_denied_mismatch_context_snapshot(self) -> None:
        snap = {"email_of_record": "alice@acme.io"}
        decision = evaluator.evaluate(
            action=_action("spoofed@evil.com", entity_snapshot=snap),
            entity_state={},
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "DENIED"

    def test_db_entity_state_takes_precedence_over_context_snapshot(self) -> None:
        """When entity_state is in DB, context snapshot must not override it."""
        # DB has alice@acme.io; attacker injects snapshot claiming evil@acme.io
        entity_state = {"email_of_record": "alice@acme.io"}
        snap = {"email_of_record": "evil@acme.io"}
        decision = evaluator.evaluate(
            action=_action("evil@acme.io", entity_snapshot=snap),
            entity_state=entity_state,
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "DENIED"


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------


class TestRecipientMatchesEdgeCases:
    def test_denied_when_recipient_email_missing_from_parameters(self) -> None:
        action = SimpleNamespace(
            action_type="issue_refund",
            parameters={"charge_id": "ch_abc", "cents": 4999},
            context={},
        )
        entity_state = {"email_of_record": "alice@acme.io"}
        decision = evaluator.evaluate(
            action=action,
            entity_state=entity_state,
            event_history=[],
            rules=[REFUND_RULE],
        )
        assert decision.decision == "DENIED"

    def test_condition_value_false_inverts_logic(self) -> None:
        """conditions: {recipient_matches_customer_of_record: false} approves on mismatch."""
        deny_on_mismatch_rule = RuleSpec(
            rule_id="deny_foreign_recipient",
            rule_version="1",
            action_type="issue_refund",
            conditions={"recipient_matches_customer_of_record": False},
            decision="DENIED",
            priority=100,
        )
        entity_state = {"email_of_record": "alice@acme.io"}
        decision = evaluator.evaluate(
            action=_action("attacker@evil.com"),
            entity_state=entity_state,
            event_history=[],
            rules=[deny_on_mismatch_rule],
        )
        assert decision.decision == "DENIED"
        assert decision.rule_id == "deny_foreign_recipient"

"""Pure Policy Evaluator — zero DB imports, fully testable in isolation.

Receives data, returns a decision. The route handler does all DB I/O around it.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any


@dataclass(frozen=True)
class RuleSpec:
    """Lightweight, DB-free representation of a policy rule."""

    rule_id: str
    rule_version: str
    action_type: str
    conditions: dict[str, Any]
    decision: str  # APPROVED | DENIED | ESCALATED
    priority: int  # higher wins when multiple rules match


@dataclass(frozen=True)
class PolicyDecision:
    decision: str  # APPROVED | DENIED | ESCALATED
    rule_id: str | None
    rule_version: str | None
    reason: str


class PolicyEvaluator:
    """Evaluate an action against a set of policy rules.

    Usage::

        evaluator = PolicyEvaluator()
        decision = evaluator.evaluate(action, entity_state, event_history, rules)

    ``action`` must expose ``.action_type`` (and optionally ``.context``).
    ``entity_state`` is the plain dict stored in the entity_state table.
    ``event_history`` is a list of event-like objects or dicts with
    ``event_type`` and ``occurred_at`` fields.
    ``rules`` is a list of :class:`RuleSpec` objects (already filtered to active).
    """

    def evaluate(
        self,
        action: Any,
        entity_state: dict[str, Any],
        event_history: list[Any],
        rules: list[RuleSpec],
    ) -> PolicyDecision:
        action_type = (
            action.action_type if hasattr(action, "action_type") else action["action_type"]
        )

        matching = [r for r in rules if r.action_type == action_type]
        # Higher priority wins; stable sort so equal priorities stay insertion-ordered.
        matching.sort(key=lambda r: r.priority, reverse=True)

        for rule in matching:
            if self._conditions_met(rule.conditions, entity_state, event_history, action):
                return PolicyDecision(
                    decision=rule.decision,
                    rule_id=rule.rule_id,
                    rule_version=rule.rule_version,
                    reason=f"Matched rule '{rule.rule_id}' v{rule.rule_version}",
                )

        return PolicyDecision(
            decision="DENIED",
            rule_id=None,
            rule_version=None,
            reason="No matching policy rule found for action type '{}'".format(action_type),
        )

    # ── condition handlers ─────────────────────────────────────────────────

    def _conditions_met(
        self,
        conditions: dict[str, Any],
        entity_state: dict[str, Any],
        event_history: list[Any],
        action: Any = None,
    ) -> bool:
        for key, value in conditions.items():
            if not self._check(key, value, entity_state, event_history, action):
                return False
        return True

    def _check(
        self,
        key: str,
        value: Any,
        entity_state: dict[str, Any],
        event_history: list[Any],
        action: Any = None,
    ) -> bool:
        if key == "operator_approved":
            # Caller attestation carried in action.context, not entity state.
            ctx: dict = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            return bool(ctx.get("operator_approved")) == bool(value)

        if key == "churn_risk":
            # entity_state["churn_risk"] must be truthy (True / "HIGH" / non-empty)
            state_val = entity_state.get("churn_risk")
            if isinstance(state_val, str):
                state_val = state_val.upper() not in ("", "FALSE", "LOW", "NONE", "NO")
            return bool(state_val) == bool(value)

        if key == "min_ltv":
            ltv = entity_state.get("ltv", 0)
            return float(ltv) >= float(value)

        if key == "no_discount_days":
            # True when there is NO discount within the last `value` days.
            cutoff = datetime.now(timezone.utc) - timedelta(days=int(value))

            # Primary: use the materialized last_discount_at field from entity state.
            last_discount_at = entity_state.get("last_discount_at")
            if last_discount_at is not None:
                if isinstance(last_discount_at, str):
                    last_discount_at = datetime.fromisoformat(
                        last_discount_at.replace("Z", "+00:00")
                    )
                if last_discount_at.tzinfo is None:
                    last_discount_at = last_discount_at.replace(tzinfo=timezone.utc)
                return last_discount_at < cutoff

            # Fallback: scan event history (used in tests / before state materializes).
            for event in event_history:
                evt_type = (
                    event.event_type if hasattr(event, "event_type") else event.get("event_type", "")
                )
                occurred_at = (
                    event.occurred_at if hasattr(event, "occurred_at") else event.get("occurred_at")
                )
                if "discount" in evt_type.lower() and occurred_at is not None:
                    if isinstance(occurred_at, str):
                        occurred_at = datetime.fromisoformat(occurred_at.replace("Z", "+00:00"))
                    if occurred_at.tzinfo is None:
                        occurred_at = occurred_at.replace(tzinfo=timezone.utc)
                    if occurred_at >= cutoff:
                        return False
            return True

        # Unknown condition key — fail closed (safe default).
        return False

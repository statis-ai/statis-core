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
    # AARM R4 five decisions + legacy ESCALATED (alias for STEP_UP).
    decision: str  # APPROVED | DENIED | ESCALATED | STEP_UP | DEFERRED | MODIFIED
    priority: int  # higher wins when multiple rules match
    # AARM R4 — DEFER tunables. Only meaningful when decision == "DEFERRED".
    defer_seconds: int | None = None
    max_defer_attempts: int | None = None
    # AARM R4 — MODIFY parameter patch. Only meaningful when decision == "MODIFIED".
    modify_patch: dict[str, Any] | None = None


@dataclass(frozen=True)
class PolicyDecision:
    # Widened in PR-AARM-01 to carry any of the five AARM decisions.
    # PR-AARM-05 adds DEFER/MODIFY config passthrough so the route handler
    # can apply the runtime transformations without re-querying the rule.
    decision: str  # APPROVED | DENIED | ESCALATED | STEP_UP | DEFERRED | MODIFIED
    rule_id: str | None
    rule_version: str | None
    reason: str
    # DEFER tunables from the matched rule (None if decision != DEFERRED).
    defer_seconds: int | None = None
    max_defer_attempts: int | None = None
    # MODIFY patch from the matched rule (None if decision != MODIFIED).
    modify_patch: dict[str, Any] | None = None


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
                    defer_seconds=rule.defer_seconds,
                    max_defer_attempts=rule.max_defer_attempts,
                    modify_patch=rule.modify_patch,
                )

        return PolicyDecision(
            decision="DENIED",
            rule_id=None,
            rule_version=None,
            reason=(
                "No policy rules configured for action type '{}'. "
                "Add rules via POST /policy-rules.".format(action_type)
            ),
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

        # ── initiative brief condition handlers ────────────────────────────

        if key == "required_fields":
            # value is a list of parameter field names that must be present and non-empty.
            params: dict = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            if not isinstance(value, list):
                return False
            for field in value:
                if not params.get(field):
                    return False
            return True

        if key == "slug_format":
            # value is a regex pattern; the action's parameters.slug must match.
            import re as _re

            params = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            slug: str = params.get("slug", "")
            try:
                return bool(_re.fullmatch(value, slug))
            except _re.error:
                return False

        if key == "min_tasks":
            # value is an int; action.parameters.tasks must have at least that many
            # workstream keys, each with a non-empty list.
            params = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            tasks = params.get("tasks", {})
            if not isinstance(tasks, dict):
                return False
            task_count = sum(
                1
                for task_list in tasks.values()
                if (isinstance(task_list, list) and len(task_list) > 0)
                or (isinstance(task_list, str) and task_list.strip())
            )
            return task_count >= int(value)

        if key == "budget_remaining":
            # value is a dict {category: limit_cents}.
            # Passes when the budget's remaining amount for the action's category
            # is at or above zero (i.e. budget has not been exhausted).
            params: dict = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            if not isinstance(value, dict):
                return False
            category: str = params.get("category", "")
            budgets: dict = entity_state.get("budgets", {})
            budget_entry: dict = budgets.get(category, {})
            remaining = budget_entry.get("remaining", 0)
            limit_cents = value.get(category, 0)
            # Passes when remaining >= 0 and remaining >= limit_cents threshold
            return float(remaining) >= float(limit_cents) and float(remaining) >= 0

        if key == "max_trade_size":
            # value is a number. Passes when action.parameters.notional <= value.
            params = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            notional = params.get("notional", 0)
            return float(notional) <= float(value)

        if key == "account_balance_min":
            # value is a number (cents). Passes when
            # entity_state.balance_cents - action.parameters.amount_cents >= value.
            params = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            balance = entity_state.get("balance_cents", 0)
            amount = params.get("amount_cents", 0)
            return float(balance) - float(amount) >= float(value)

        # ── GitHub dogfood condition handlers ─────────────────────────────

        if key == "ci_status":
            # entity_state["ci_status"] must equal the expected value (e.g. "passed").
            return str(entity_state.get("ci_status", "")).lower() == str(value).lower()

        if key == "approvals_gte":
            # entity_state["approvals"] must be >= the threshold.
            approvals = entity_state.get("approvals", 0)
            return int(approvals) >= int(value)

        if key == "environment":
            # Match entity_state["environment"] or action.parameters["environment"].
            env_state = entity_state.get("environment", "")
            if str(env_state).lower() == str(value).lower():
                return True
            # Fallback: check action parameters.
            params: dict = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            return str(params.get("environment", "")).lower() == str(value).lower()

        if key == "opened_by_agent":
            # entity_state["opened_by_agent"] must match the expected bool.
            return bool(entity_state.get("opened_by_agent")) == bool(value)

        # ── outreach agent condition handlers ────────────────────────────

        if key == "tier":
            ctx: dict = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            tier = ctx.get("tier")
            if tier is None:
                return False
            try:
                tier = int(tier)
            except (ValueError, TypeError):
                return False
            if isinstance(value, list):
                return tier in [int(v) for v in value]
            try:
                return tier == int(value)
            except (ValueError, TypeError):
                return False

        if key == "has_company_domain":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            domain = ctx.get("company_domain") or ""
            verified = bool(ctx.get("domain_verified", False))
            present_and_verified = bool(domain) and verified
            return present_and_verified == bool(value)

        if key == "not_aggregator_domain":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            is_aggregator = bool(ctx.get("is_aggregator_domain", False))
            return (not is_aggregator) == bool(value)

        if key == "not_competitor":
            ctx: dict = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            is_competitor = bool(ctx.get("is_competitor", False))
            return (not is_competitor) == bool(value)

        if key == "company_batch_in":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            batch = (ctx.get("company_batch") or "").strip()
            if not isinstance(value, list):
                return False
            return batch in value

        if key == "max_signal_age_days":
            ctx: dict = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            seen_at = ctx.get("signal_seen_at")
            if not seen_at:
                return False
            try:
                if isinstance(seen_at, str):
                    seen_at = datetime.fromisoformat(seen_at.replace("Z", "+00:00"))
                if seen_at.tzinfo is None:
                    seen_at = seen_at.replace(tzinfo=timezone.utc)
                age = datetime.now(timezone.utc) - seen_at
                return age.total_seconds() <= float(value) * 86400.0
            except (ValueError, TypeError):
                return False

        if key == "min_signal_length":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            length = ctx.get("signal_length", 0)
            return int(length) >= int(value)

        if key == "allowed_sources":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            source = ctx.get("source", "")
            if not isinstance(value, list):
                return False
            return source in value

        if key == "has_inferred_role":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            role = ctx.get("inferred_role")
            present = bool(role) and str(role).lower() not in ("null", "none", "unknown", "")
            return present == bool(value)

        if key == "not_disqualified":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            disqualified = bool(ctx.get("disqualified", False))
            return (not disqualified) == bool(value)

        if key == "days_since_last_contact_gte":
            ctx: dict = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            days = ctx.get("days_since_last_contact")
            if days is None:
                return False
            return float(days) >= float(value)

        if key == "dnc":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            return bool(ctx.get("dnc", False)) == bool(value)

        if key == "min_icp_score":
            ctx = {}
            if action is not None:
                ctx = action.context if hasattr(action, "context") else action.get("context", {})
            score = ctx.get("icp_score", 0)
            return float(score) >= float(value)

        if key == "max_message_len":
            params: dict = {}
            if action is not None:
                params = (
                    action.parameters
                    if hasattr(action, "parameters")
                    else action.get("parameters", {})
                )
            body = params.get("message_body", "") or params.get("body", "")
            return len(body) <= int(value)

        if key == "canonical_args_hash":
            # Graduation (migration 0045). The auto-drafted rule pins the
            # exact canonical args shape that earned 3 prior approvals;
            # the evaluator does a literal equality check against the
            # incoming action's hash, populated at propose time per spine
            # (commit e736831).
            action_hash = None
            if action is not None:
                action_hash = (
                    action.canonical_args_hash
                    if hasattr(action, "canonical_args_hash")
                    else action.get("canonical_args_hash")
                )
            return action_hash is not None and str(action_hash) == str(value)

        if key == "recipient_matches_customer_of_record":
            # action.parameters.recipient_email must equal the customer's email_of_record.
            # Primary source: entity_state loaded from DB by the route handler.
            # Fallback: entity snapshot in action.context["entity"] (set via SDK entity= callback).
            if action is None:
                return False
            params = (
                action.parameters if hasattr(action, "parameters") else action.get("parameters", {})
            ) or {}
            recipient = str(params.get("recipient_email", "")).strip().lower()

            email_of_record = entity_state.get("email_of_record")
            if not email_of_record:
                ctx = (
                    action.context if hasattr(action, "context") else action.get("context", {})
                ) or {}
                entity_snap = ctx.get("entity") or {}
                email_of_record = entity_snap.get("email_of_record", "")

            email_of_record = str(email_of_record).strip().lower()
            match = bool(recipient) and bool(email_of_record) and recipient == email_of_record
            return match == bool(value)

        # Unknown condition key — fail closed (safe default).
        return False

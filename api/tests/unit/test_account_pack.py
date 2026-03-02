"""Unit tests for the Account State Pack v2 reducers, alias resolution,
schema upgrade, and conflict rules.
"""
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from app.reducers.account import (
    reduce_churn_risk_updated,
    reduce_discount_applied,
    reduce_escalation_requested,
    reduce_incident_reported,
    reduce_ltv_updated,
    reduce_plan_changed,
    reduce_schema_migrated,
    reduce_sentiment_updated,
    reduce_ticket_updated,
)
from app.reducers.account_schema import (
    SCHEMA_VERSION,
    ensure_v2,
    init_account_v2,
    upgrade_v1_to_v2,
)
from app.reducers.conflict_rules import should_apply, source_rank
from app.reducers.registry import get_reducer, has_reducer


def _evt(event_type: str, payload: dict, producer: str = "test") -> SimpleNamespace:
    return SimpleNamespace(event_type=event_type, payload=payload, producer=producer)


# ── schema helpers ────────────────────────────────────────────────────────

class TestAccountSchema:
    def test_init_v2_has_all_keys(self) -> None:
        s = init_account_v2()
        for key in ("schema_version", "blockers", "risk_flags", "sentiment",
                     "open_incidents", "churn_risk", "next_actions", "plan", "extensions"):
            assert key in s
        assert s["schema_version"] == SCHEMA_VERSION

    def test_upgrade_v1_to_v2_empty(self) -> None:
        result = upgrade_v1_to_v2({})
        assert result["schema_version"] == SCHEMA_VERSION
        assert result["plan"] is None

    def test_upgrade_v1_to_v2_with_plan_and_tickets(self) -> None:
        v1 = {"plan": "pro", "tickets": {"t1": {"ticket_id": "t1", "status": "open"}}}
        v2 = upgrade_v1_to_v2(v1)
        assert v2["plan"] == "pro"
        assert len(v2["open_incidents"]) == 1
        assert v2["open_incidents"][0]["id"] == "t1"
        assert v2["extensions"]["tickets"]["t1"]["status"] == "open"

    def test_upgrade_is_idempotent(self) -> None:
        v2 = init_account_v2()
        v2["plan"] = "enterprise"
        result = upgrade_v1_to_v2(v2)
        assert result == v2

    def test_ensure_v2_upgrades_v1(self) -> None:
        result = ensure_v2({"plan": "starter"})
        assert result["schema_version"] == SCHEMA_VERSION

    def test_ensure_v2_copies_v2(self) -> None:
        original = init_account_v2()
        original["plan"] = "pro"
        copy = ensure_v2(original)
        copy["plan"] = "enterprise"
        assert original["plan"] == "pro"


# ── incident_reported ─────────────────────────────────────────────────────

class TestIncidentReported:
    def test_appends_incident(self) -> None:
        evt = _evt("support.incident_reported", {
            "incident_id": "inc_1", "type": "outage", "status": "open",
            "occurred_at": "2026-02-19T10:00:00Z", "severity": "low",
        })
        result = reduce_incident_reported({}, evt)
        assert len(result["open_incidents"]) == 1
        assert result["open_incidents"][0]["id"] == "inc_1"

    def test_high_severity_adds_blocker(self) -> None:
        evt = _evt("support.incident_reported", {
            "incident_id": "inc_2", "severity": "high", "summary": "DB down",
        })
        result = reduce_incident_reported({}, evt)
        assert "DB down" in result["blockers"]

    def test_low_severity_no_blocker(self) -> None:
        evt = _evt("support.incident_reported", {
            "incident_id": "inc_3", "severity": "low", "summary": "Minor issue",
        })
        result = reduce_incident_reported({}, evt)
        assert result["blockers"] == []

    def test_churn_risk_at_three_open(self) -> None:
        state = init_account_v2()
        for i in range(3):
            evt = _evt("support.incident_reported", {
                "incident_id": f"inc_{i}", "severity": "low", "status": "open",
            })
            state = reduce_incident_reported(state, evt)
        assert state["churn_risk"] is True

    def test_does_not_mutate_input(self) -> None:
        state = {"plan": "starter"}
        evt = _evt("support.incident_reported", {"incident_id": "inc_1", "severity": "low"})
        reduce_incident_reported(state, evt)
        assert "open_incidents" not in state


# ── sentiment_updated ─────────────────────────────────────────────────────

class TestSentimentUpdated:
    def test_sets_sentiment(self) -> None:
        evt = _evt("support.sentiment_updated", {
            "label": "negative", "updated_at": "2026-02-19T10:00:00Z",
        }, producer="system")
        result = reduce_sentiment_updated({}, evt)
        assert result["sentiment"]["label"] == "negative"

    def test_source_precedence_blocks_lower(self) -> None:
        state = init_account_v2()
        state["sentiment"] = {"label": "negative", "updated_at": "", "source": "system"}
        evt = _evt("support.sentiment_updated", {"label": "positive"}, producer="agent")
        result = reduce_sentiment_updated(state, evt)
        assert result["sentiment"]["label"] == "negative"

    def test_source_precedence_allows_higher(self) -> None:
        state = init_account_v2()
        state["sentiment"] = {"label": "negative", "updated_at": "", "source": "agent"}
        evt = _evt("support.sentiment_updated", {"label": "positive"}, producer="system")
        result = reduce_sentiment_updated(state, evt)
        assert result["sentiment"]["label"] == "positive"


# ── plan_changed (downgrade risk) ─────────────────────────────────────────

class TestPlanChanged:
    def test_downgrade_adds_risk_flag(self) -> None:
        state = init_account_v2()
        state["plan"] = "enterprise"
        evt = _evt("billing.plan_changed", {"plan": "starter"})
        result = reduce_plan_changed(state, evt)
        assert any("plan_downgrade" in f for f in result["risk_flags"])

    def test_upgrade_no_risk_flag(self) -> None:
        state = init_account_v2()
        state["plan"] = "starter"
        evt = _evt("billing.plan_changed", {"plan": "enterprise"})
        result = reduce_plan_changed(state, evt)
        assert result["risk_flags"] == []


# ── escalation_requested ──────────────────────────────────────────────────

class TestEscalationRequested:
    def test_appends_action(self) -> None:
        evt = _evt("csm.escalation_requested", {
            "owner": "sales", "action": "schedule call", "reason": "churn risk",
        })
        result = reduce_escalation_requested({}, evt)
        assert len(result["next_actions"]) == 1
        assert result["next_actions"][0]["owner"] == "sales"

    def test_does_not_mutate_input(self) -> None:
        state = init_account_v2()
        evt = _evt("csm.escalation_requested", {"owner": "csm", "action": "call", "reason": "x"})
        reduce_escalation_requested(state, evt)
        assert state["next_actions"] == []


# ── schema_migrated ───────────────────────────────────────────────────────

class TestSchemaMigrated:
    def test_upgrades_v1(self) -> None:
        v1 = {"plan": "pro", "tickets": {"t1": {"ticket_id": "t1", "status": "open"}}}
        evt = _evt("account.schema_migrated", {})
        result = reduce_schema_migrated(v1, evt)
        assert result["schema_version"] == SCHEMA_VERSION
        assert result["plan"] == "pro"

    def test_idempotent_on_v2(self) -> None:
        v2 = init_account_v2()
        v2["plan"] = "enterprise"
        evt = _evt("account.schema_migrated", {})
        result = reduce_schema_migrated(v2, evt)
        assert result == v2


# ── conflict rules ────────────────────────────────────────────────────────

class TestConflictRules:
    def test_source_rank_ordering(self) -> None:
        assert source_rank("system") > source_rank("human")
        assert source_rank("human") > source_rank("agent")
        assert source_rank("agent") > source_rank("unknown_thing")

    def test_should_apply_no_existing(self) -> None:
        assert should_apply(None, "agent") is True

    def test_should_apply_higher_precedence(self) -> None:
        assert should_apply("agent", "system") is True

    def test_should_apply_lower_precedence(self) -> None:
        assert should_apply("system", "agent") is False

    def test_should_apply_equal_precedence(self) -> None:
        assert should_apply("human", "human") is True


# ── billing.ltv_updated ───────────────────────────────────────────────────

class TestLtvUpdated:
    def test_sets_ltv(self) -> None:
        evt = _evt("billing.ltv_updated", {"ltv": 1200})
        result = reduce_ltv_updated({}, evt)
        assert result["ltv"] == 1200

    def test_overwrites_existing_ltv(self) -> None:
        state = init_account_v2()
        state["ltv"] = 500
        evt = _evt("billing.ltv_updated", {"ltv": 2000})
        result = reduce_ltv_updated(state, evt)
        assert result["ltv"] == 2000

    def test_defaults_to_zero_when_payload_missing_ltv(self) -> None:
        evt = _evt("billing.ltv_updated", {})
        result = reduce_ltv_updated({}, evt)
        assert result["ltv"] == 0

    def test_does_not_mutate_input(self) -> None:
        state = init_account_v2()
        state["ltv"] = 100
        evt = _evt("billing.ltv_updated", {"ltv": 999})
        reduce_ltv_updated(state, evt)
        assert state["ltv"] == 100

    def test_registered_in_registry(self) -> None:
        from app.reducers.registry import get_reducer
        assert get_reducer("billing.ltv_updated") is reduce_ltv_updated


# ── billing.discount_applied ──────────────────────────────────────────────

class TestDiscountApplied:
    def test_sets_last_discount_at_from_event(self) -> None:
        ts = datetime(2026, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        evt = SimpleNamespace(
            event_type="billing.discount_applied",
            payload={"discount_pct": 10, "duration_days": 30},
            producer="billing",
            occurred_at=ts,
        )
        result = reduce_discount_applied({}, evt)
        assert result["last_discount_at"] == ts

    def test_falls_back_to_payload_occurred_at(self) -> None:
        ts = "2026-01-15T12:00:00Z"
        evt = _evt("billing.discount_applied", {"discount_pct": 10, "occurred_at": ts})
        result = reduce_discount_applied({}, evt)
        assert result["last_discount_at"] == ts

    def test_overwrites_previous_discount(self) -> None:
        old_ts = datetime(2026, 1, 1, tzinfo=timezone.utc)
        new_ts = datetime(2026, 2, 1, tzinfo=timezone.utc)
        state = init_account_v2()
        state["last_discount_at"] = old_ts
        evt = SimpleNamespace(
            event_type="billing.discount_applied",
            payload={},
            producer="billing",
            occurred_at=new_ts,
        )
        result = reduce_discount_applied(state, evt)
        assert result["last_discount_at"] == new_ts

    def test_does_not_mutate_input(self) -> None:
        ts = datetime(2026, 1, 15, tzinfo=timezone.utc)
        state = init_account_v2()
        evt = SimpleNamespace(
            event_type="billing.discount_applied",
            payload={},
            producer="billing",
            occurred_at=ts,
        )
        reduce_discount_applied(state, evt)
        assert state["last_discount_at"] is None

    def test_registered_in_registry(self) -> None:
        from app.reducers.registry import get_reducer
        assert get_reducer("billing.discount_applied") is reduce_discount_applied


# ── account.churn_risk_updated ────────────────────────────────────────────

class TestChurnRiskUpdated:
    def test_sets_churn_risk_true(self) -> None:
        evt = _evt("account.churn_risk_updated", {"churn_risk": True})
        result = reduce_churn_risk_updated({}, evt)
        assert result["churn_risk"] is True

    def test_sets_churn_risk_false(self) -> None:
        state = init_account_v2()
        state["churn_risk"] = True
        evt = _evt("account.churn_risk_updated", {"churn_risk": False})
        result = reduce_churn_risk_updated(state, evt)
        assert result["churn_risk"] is False

    def test_defaults_to_false_when_key_missing(self) -> None:
        evt = _evt("account.churn_risk_updated", {})
        result = reduce_churn_risk_updated({}, evt)
        assert result["churn_risk"] is False

    def test_does_not_mutate_input(self) -> None:
        state = init_account_v2()
        state["churn_risk"] = False
        evt = _evt("account.churn_risk_updated", {"churn_risk": True})
        reduce_churn_risk_updated(state, evt)
        assert state["churn_risk"] is False

    def test_registered_in_registry(self) -> None:
        assert get_reducer("account.churn_risk_updated") is reduce_churn_risk_updated


# ── alias resolution ──────────────────────────────────────────────────────

class TestAliasResolution:
    def test_old_ticket_updated_resolves(self) -> None:
        assert has_reducer("ticket.updated")
        assert get_reducer("ticket.updated") is reduce_ticket_updated

    def test_old_plan_changed_resolves(self) -> None:
        assert has_reducer("plan.changed")
        assert get_reducer("plan.changed") is reduce_plan_changed

    def test_canonical_names_resolve(self) -> None:
        assert get_reducer("support.ticket_updated") is reduce_ticket_updated
        assert get_reducer("billing.plan_changed") is reduce_plan_changed

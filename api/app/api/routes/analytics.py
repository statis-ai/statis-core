from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.action_contract import ActionContract
from app.models.receipt import Receipt
from app.schemas.analytics import AgentStat, AnalyticsSummary, DailyBucket, RuleStat

router = APIRouter(tags=["analytics"])

# Statuses that count as "approved" for approval-rate purposes
_APPROVED_STATUSES = {"APPROVED", "COMPLETED", "SHADOW_COMPLETE"}
_DENIED_STATUSES = {"DENIED"}
_ESCALATED_STATUSES = {"ESCALATED"}


@router.get("/analytics/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
) -> AnalyticsSummary:
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # ── Total counts by status bucket ────────────────────────────────────────
    rows = (
        db.query(ActionContract.status, func.count().label("n"))
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.created_at >= since,
        )
        .group_by(ActionContract.status)
        .all()
    )

    approved = denied = escalated = total = 0
    for status, n in rows:
        total += n
        if status in _APPROVED_STATUSES:
            approved += n
        elif status in _DENIED_STATUSES:
            denied += n
        elif status in _ESCALATED_STATUSES:
            escalated += n

    denominator = approved + denied + escalated
    approval_rate = round(approved / denominator, 4) if denominator > 0 else 0.0

    # ── Top 5 rules by fire count ─────────────────────────────────────────────
    rule_rows = (
        db.query(Receipt.rule_id, Receipt.decision, func.count().label("fires"))
        .join(ActionContract, Receipt.action_id == ActionContract.action_id)
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.created_at >= since,
            Receipt.rule_id.isnot(None),
        )
        .group_by(Receipt.rule_id, Receipt.decision)
        .order_by(func.count().desc())
        .limit(5)
        .all()
    )
    top_rules = [
        RuleStat(rule_id=r, fires=f, decision=d) for r, d, f in rule_rows
    ]

    # ── Top 5 agents by action count ─────────────────────────────────────────
    agent_rows = (
        db.query(ActionContract.proposed_by, func.count().label("actions"))
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.created_at >= since,
        )
        .group_by(ActionContract.proposed_by)
        .order_by(func.count().desc())
        .limit(5)
        .all()
    )
    top_agents = [AgentStat(agent_id=a, actions=n) for a, n in agent_rows]

    # ── Daily trend ───────────────────────────────────────────────────────────
    day_col = func.date_trunc("day", ActionContract.created_at).label("day")
    trend_rows = (
        db.query(
            day_col,
            func.count(
                case((ActionContract.status.in_(_APPROVED_STATUSES), 1))
            ).label("approved"),
            func.count(
                case((ActionContract.status.in_(_DENIED_STATUSES), 1))
            ).label("denied"),
            func.count(
                case((ActionContract.status.in_(_ESCALATED_STATUSES), 1))
            ).label("escalated"),
        )
        .filter(
            ActionContract.tenant_id == auth.tenant_id,
            ActionContract.created_at >= since,
        )
        .group_by(day_col)
        .order_by(day_col.asc())
        .all()
    )
    daily_trend = [
        DailyBucket(
            date=row.day.strftime("%Y-%m-%d"),
            approved=row.approved,
            denied=row.denied,
            escalated=row.escalated,
        )
        for row in trend_rows
    ]

    return AnalyticsSummary(
        period_days=days,
        actions_total=total,
        actions_approved=approved,
        actions_denied=denied,
        actions_escalated=escalated,
        approval_rate=approval_rate,
        top_rules=top_rules,
        top_agents=top_agents,
        daily_trend=daily_trend,
    )

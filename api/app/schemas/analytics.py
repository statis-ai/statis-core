from pydantic import BaseModel


class RuleStat(BaseModel):
    rule_id: str
    fires: int
    decision: str


class AgentStat(BaseModel):
    agent_id: str
    actions: int


class DailyBucket(BaseModel):
    date: str          # ISO date string: "2026-04-01"
    approved: int
    denied: int
    escalated: int


class AnalyticsSummary(BaseModel):
    period_days: int
    actions_total: int
    actions_approved: int
    actions_denied: int
    actions_escalated: int
    approval_rate: float
    top_rules: list[RuleStat]
    top_agents: list[AgentStat]
    daily_trend: list[DailyBucket]

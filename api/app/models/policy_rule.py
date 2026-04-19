from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PolicyRule(Base):
    __tablename__ = "policy_rules"
    __table_args__ = (
        Index("ix_policy_rules_action_type_active", "action_type", "active"),
        Index("ix_policy_rules_tenant_action_active", "tenant_id", "action_type", "active"),
    )

    rule_id: Mapped[str] = mapped_column(String, primary_key=True)
    tenant_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    rule_version: Mapped[str] = mapped_column(String, nullable=False)
    action_type: Mapped[str] = mapped_column(String, nullable=False)
    conditions: Mapped[dict] = mapped_column(JSONB, nullable=False)
    decision: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    # AARM R4 — DEFER tunables (applied when the rule's decision is DEFERRED)
    defer_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_defer_attempts: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # AARM R4 — MODIFY parameter patch (shallow-merged into action.parameters on MODIFIED decisions)
    modify_patch: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

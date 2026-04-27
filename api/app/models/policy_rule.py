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
        Index(
            "ix_policy_rules_graduation_lookup",
            "tenant_id",
            "action_type",
            "canonical_args_hash",
        ),
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
    # Graduation (migration 0045). For source='graduated' rules,
    # canonical_args_hash holds the exact shape the rule auto-approves;
    # graduated_from_action_id points back at the 3rd approval that
    # triggered the draft. Manual rules leave both NULL.
    canonical_args_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="manual", default="manual"
    )
    graduated_from_action_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

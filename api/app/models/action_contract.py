from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ActionContract(Base):
    __tablename__ = "action_contracts"
    __table_args__ = (
        Index("ix_action_contracts_tenant_status", "tenant_id", "status"),
        Index(
            "ix_action_contracts_graduation_lookup",
            "tenant_id",
            "action_type",
            "canonical_args_hash",
            "status",
            "decided_at",
        ),
        Index(
            "ix_action_contracts_agent_activity",
            "tenant_id",
            "proposed_by",
            "decided_at",
        ),
        UniqueConstraint("decided_via_token", name="uq_action_contracts_decided_via_token"),
    )

    action_id: Mapped[str] = mapped_column(String, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String, nullable=False)
    proposed_by: Mapped[str] = mapped_column(String, nullable=False)
    # AARM R6 — 4-layer identity binding (resolved at propose time)
    agent_class: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    org_unit: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    trust_source: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    action_type: Mapped[str] = mapped_column(String, nullable=False)
    target_entity: Mapped[dict] = mapped_column(JSONB, nullable=False)
    target_system: Mapped[str] = mapped_column(String, nullable=False)
    parameters: Mapped[dict] = mapped_column(JSONB, nullable=False)
    context: Mapped[dict] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    mode: Mapped[str] = mapped_column(String, nullable=False, server_default="live")
    # AARM R4 — DEFER state machine. deferred_until is the wall-clock moment
    # the action becomes eligible for re-evaluation; defer_count tracks how
    # many DEFER decisions have been issued (capped by rule.max_defer_attempts).
    deferred_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    defer_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0", default=0
    )
    # Spine — atomic CAS for token consumption (migration 0039, plan A4)
    decided_via_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Spine — graduation lookup (migration 0040, plan A6)
    canonical_args_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Spine — frozen agent identity at propose time (migration 0042, plan OV-T2)
    agent_identity_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    # Lane 1 — operator-set "not now" timestamp on the graduation banner.
    # Codex finding #13. NULL == not snoozed; populated by console action.
    graduation_snoozed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

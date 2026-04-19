from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ActionContract(Base):
    __tablename__ = "action_contracts"
    __table_args__ = (
        Index("ix_action_contracts_tenant_status", "tenant_id", "status"),
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

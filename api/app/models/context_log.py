"""AARM R2 — append-only, hash-chained context log.

Every field flowing into an action's context channel produces one row here.
Rows are never updated or deleted; the chain_hash column links each entry
to its predecessor so auditors can detect insertion, deletion, or reorder
tampering.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ContextLogEntry(Base):
    __tablename__ = "context_log_entries"
    __table_args__ = (
        Index("ix_context_log_action", "action_id", "sequence"),
        Index("ix_context_log_tenant", "tenant_id"),
    )

    entry_id: Mapped[str] = mapped_column(String, primary_key=True)
    action_id: Mapped[str] = mapped_column(String, nullable=False)
    tenant_id: Mapped[str] = mapped_column(String, nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)

    field_key: Mapped[str] = mapped_column(String, nullable=False)
    # One of PUBLIC | INTERNAL | PII | SECRET | SYSTEM (app.security.classifier)
    classification: Mapped[str] = mapped_column(String(16), nullable=False)

    # SHA-256 of canonical {"key":..., "value":...}. Raw values never persisted here.
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    # NULL for sequence=0; otherwise the chain_hash of the previous entry.
    previous_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    # SHA-256 of (previous_hash || content_hash). This is the tamper-evidence anchor.
    chain_hash: Mapped[str] = mapped_column(String(64), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

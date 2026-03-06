from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Receipt(Base):
    __tablename__ = "receipts"

    receipt_id: Mapped[str] = mapped_column(String, primary_key=True)
    # One receipt per action; action_id doubles as an idempotency key
    action_id: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    decision: Mapped[str] = mapped_column(String, nullable=False)
    rule_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rule_version: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    approved_by: Mapped[str] = mapped_column(String, nullable=False)
    executed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    execution_result: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    hash: Mapped[str] = mapped_column(String, nullable=False)
    # Supplementary audit fields — not included in canonical hash
    conditions_evaluated: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    entity_state_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

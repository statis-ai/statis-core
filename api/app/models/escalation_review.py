from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EscalationReview(Base):
    __tablename__ = "escalation_reviews"

    review_id: Mapped[str] = mapped_column(String, primary_key=True)
    action_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("action_contracts.action_id"),
        nullable=False,
        unique=True,
    )
    reviewer_id: Mapped[str] = mapped_column(String, nullable=False)
    reviewer_decision: Mapped[str] = mapped_column(String, nullable=False)  # APPROVED | REJECTED
    reviewer_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

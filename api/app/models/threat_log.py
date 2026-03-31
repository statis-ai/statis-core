from datetime import datetime

from sqlalchemy import DateTime, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ThreatLog(Base):
    __tablename__ = "threat_logs"
    __table_args__ = (
        Index("ix_threat_logs_tenant_id", "tenant_id"),
        Index("ix_threat_logs_action_id", "action_id"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    action_id: Mapped[str] = mapped_column(String, nullable=False)
    tenant_id: Mapped[str] = mapped_column(String, nullable=False)
    threat_types: Mapped[list] = mapped_column(JSONB, nullable=False)  # list[str]
    threat_level: Mapped[str] = mapped_column(String, nullable=False)
    details: Mapped[str] = mapped_column(String, nullable=True)
    scanned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

from datetime import datetime

from sqlalchemy import DateTime, Index, String, func
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
    action_type: Mapped[str] = mapped_column(String, nullable=False)
    target_entity: Mapped[dict] = mapped_column(JSONB, nullable=False)
    target_system: Mapped[str] = mapped_column(String, nullable=False)
    parameters: Mapped[dict] = mapped_column(JSONB, nullable=False)
    context: Mapped[dict] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    mode: Mapped[str] = mapped_column(String, nullable=False, server_default="live")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

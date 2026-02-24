from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EntityState(Base):
    __tablename__ = "entity_state"

    tenant_id: Mapped[str] = mapped_column(String, primary_key=True)
    entity_type: Mapped[str] = mapped_column(String, primary_key=True)
    entity_id: Mapped[str] = mapped_column(String, primary_key=True)
    state: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    state_version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_event_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_occurred_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    state_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    materialized_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    provenance_event_ids: Mapped[List[str]] = mapped_column(
        JSONB, nullable=False, default=list
    )

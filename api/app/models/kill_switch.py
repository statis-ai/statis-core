from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KillSwitch(Base):
    __tablename__ = "kill_switches"

    tenant_id: Mapped[str] = mapped_column(String, primary_key=True)
    active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    activated_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)

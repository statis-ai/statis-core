from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ExecutionLock(Base):
    """Row-per-action distributed lock for the execution worker.

    Insertion is attempted with ON CONFLICT DO NOTHING.
    Zero rows inserted → another worker holds the lock → skip.
    Deleted immediately after execution completes or fails.
    """

    __tablename__ = "execution_locks"

    action_id: Mapped[str] = mapped_column(String, primary_key=True)
    worker_id: Mapped[str] = mapped_column(String, nullable=False)
    acquired_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

"""Per-tenant HMAC signing key for action approval URLs.

See migration 0041_tenant_signing_keys.py and app/crypto/hmac_tokens.py.
`rotated_at` is the cutoff: tokens with `iat < rotated_at` are rejected
("rotation = revocation" per D2 runbook).
"""
from datetime import datetime

from sqlalchemy import DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TenantSigningKey(Base):
    __tablename__ = "tenant_signing_keys"

    tenant_id: Mapped[str] = mapped_column(Text, primary_key=True)
    signing_key: Mapped[str] = mapped_column(Text, nullable=False)
    rotated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

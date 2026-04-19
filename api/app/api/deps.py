import hashlib
from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import ApiKey


@dataclass
class AuthContext:
    tenant_id: str
    role: Optional[str] = None
    agent_id: Optional[str] = None
    # AARM R6 layer 4: trust chain source resolved from the API key record.
    # Defaults to "api_key"; future values: "oauth", "mtls".
    trust_source: str = "api_key"

    @property
    def is_admin(self) -> bool:
        return self.role is None or self.role == "admin"


def get_auth_context(
    x_api_key: str = Header(...), db: Session = Depends(get_db)
) -> AuthContext:
    """Validate X-API-Key and return the full auth context."""
    hashed_key = hashlib.sha256(x_api_key.encode()).hexdigest()
    api_key_record = db.query(ApiKey).filter(ApiKey.hashed_key == hashed_key).first()

    if not api_key_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )

    return AuthContext(
        tenant_id=api_key_record.tenant_id,
        role=api_key_record.role,
        agent_id=api_key_record.agent_id,
        trust_source=api_key_record.trust_source or "api_key",
    )


def get_tenant_id(
    x_api_key: str = Header(...), db: Session = Depends(get_db)
) -> str:
    """Backward-compatible wrapper returning just tenant_id."""
    return get_auth_context(x_api_key=x_api_key, db=db).tenant_id

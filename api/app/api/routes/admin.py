from __future__ import annotations
import hashlib
import uuid
import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import ApiKey
from app.api.deps import AuthContext, get_auth_context


router = APIRouter(prefix="/admin", tags=["admin"])


class SignupRequest(BaseModel):
    email: str
    project_name: str


class SignupResponse(BaseModel):
    tenant_id: str
    api_key: str
    label: str


class ApiKeyResponse(BaseModel):
    id: str
    tenant_id: str
    label: str | None
    role: str | None
    agent_id: str | None
    created_at: datetime
    key_preview: str


class CreateApiKeyRequest(BaseModel):
    label: str | None = None
    role: str | None = None
    agent_id: str | None = None


class CreateApiKeyResponse(BaseModel):
    raw_key: str
    id: str
    label: str | None
    role: str | None
    agent_id: str | None


def _generate_api_key(
    tenant_id: str,
    label: str | None,
    db: Session,
    *,
    role: Optional[str] = None,
    agent_id: Optional[str] = None,
) -> tuple[str, ApiKey]:
    """Internal helper to generate, hash, and store a new API key."""
    raw_key = f"st_{secrets.token_urlsafe(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()

    key_id = str(uuid.uuid4())
    api_key_record = ApiKey(
        id=key_id,
        hashed_key=hashed_key,
        tenant_id=tenant_id,
        label=label,
        role=role,
        agent_id=agent_id,
    )

    db.add(api_key_record)
    db.commit()
    db.refresh(api_key_record)

    return raw_key, api_key_record


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Onboard a new user and project. Creates a tenant and its first master API key."""
    try:
        tenant_id = f"tenant_{uuid.uuid4().hex[:12]}"
        label = f"Master Key ({request.email})"
        raw_key, _ = _generate_api_key(tenant_id, label, db)
        return SignupResponse(
            tenant_id=tenant_id,
            api_key=raw_key,
            label=label,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}",
        )


@router.post("/api-keys", response_model=CreateApiKeyResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    request: CreateApiKeyRequest,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
):
    """Generate a new API key for the current tenant. The raw key is returned exactly once."""
    label = request.label or "New API Key"
    raw_key, api_key_record = _generate_api_key(
        auth.tenant_id,
        label,
        db,
        role=request.role,
        agent_id=request.agent_id,
    )

    return CreateApiKeyResponse(
        raw_key=raw_key,
        id=api_key_record.id,
        label=api_key_record.label,
        role=api_key_record.role,
        agent_id=api_key_record.agent_id,
    )


@router.get("/me")
def get_current_user(
    auth: AuthContext = Depends(get_auth_context),
):
    """Retrieve auth details for the current API key."""
    return {
        "tenant_id": auth.tenant_id,
        "role": auth.role,
        "agent_id": auth.agent_id,
    }


@router.get("/api-keys", response_model=list[ApiKeyResponse])
def list_api_keys(
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
):
    """List all API keys for the current tenant (obfuscated)."""
    keys = (
        db.query(ApiKey)
        .filter(ApiKey.tenant_id == auth.tenant_id)
        .order_by(ApiKey.created_at.desc())
        .all()
    )

    return [
        ApiKeyResponse(
            id=k.id,
            tenant_id=k.tenant_id,
            label=k.label,
            role=k.role,
            agent_id=k.agent_id,
            created_at=k.created_at,
            key_preview="st_••••••••••••••••",
        )
        for k in keys
    ]

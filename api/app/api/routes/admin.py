from __future__ import annotations
import hashlib
import uuid
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import ApiKey
from app.api.deps import get_tenant_id


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
    created_at: datetime
    key_preview: str  # e.g., "st_...abcd"


class CreateApiKeyRequest(BaseModel):
    label: str | None = None


class CreateApiKeyResponse(BaseModel):
    raw_key: str
    id: str
    label: str | None


def _generate_api_key(tenant_id: str, label: str | None, db: Session) -> tuple[str, ApiKey]:
    """Internal helper to generate, hash, and store a new API key."""
    # Prefix helps easily identify keys
    raw_key = f"st_{secrets.token_urlsafe(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
    
    key_id = str(uuid.uuid4())
    api_key_record = ApiKey(
        id=key_id,
        hashed_key=hashed_key,
        tenant_id=tenant_id,
        label=label
    )
    
    db.add(api_key_record)
    db.commit()
    db.refresh(api_key_record)
    
    return raw_key, api_key_record


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Onboard a new user and project. 
    Creates a new tenant_id and its first master API key.
    """
    # Create a unique tenant_id for this project
    tenant_id = f"tenant_{uuid.uuid4().hex[:12]}"
    
    label = f"Master Key ({request.email})"
    raw_key, _ = _generate_api_key(tenant_id, label, db)
    
    return SignupResponse(
        tenant_id=tenant_id,
        api_key=raw_key,
        label=label
    )


@router.post("/api-keys", response_model=CreateApiKeyResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    request: CreateApiKeyRequest, 
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Generate a new API key for the current tenant.
    The raw key is returned exactly once.
    """
    label = request.label or "New API Key"
    raw_key, api_key_record = _generate_api_key(tenant_id, label, db)
    
    return CreateApiKeyResponse(
        raw_key=raw_key,
        id=api_key_record.id,
        label=api_key_record.label
    )


@router.get("/api-keys", response_model=list[ApiKeyResponse])
def list_api_keys(
    tenant_id: str = Depends(get_tenant_id),
    db: Session = Depends(get_db)
):
    """
    List all API keys for the current tenant.
    Shows only obfuscated versions of the keys based on their record presence.
    """
    keys = db.query(ApiKey).filter(ApiKey.tenant_id == tenant_id).order_by(ApiKey.created_at.desc()).all()
    
    result = []
    for k in keys:
        # Since we only store the hashed key, we can't show the real preview.
        # We will just show a generic mask.
        result.append(
            ApiKeyResponse(
                id=k.id,
                tenant_id=k.tenant_id,
                label=k.label,
                created_at=k.created_at,
                key_preview="st_••••••••••••••••"
            )
        )
        
    return result

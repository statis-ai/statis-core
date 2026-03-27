from __future__ import annotations
import hashlib
import hmac
import uuid
import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import ApiKey
from app.models.user import User
from app.api.deps import AuthContext, get_auth_context


router = APIRouter(prefix="/admin", tags=["admin"])


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def _verify_password(password: str, password_hash: str) -> bool:
    return hmac.compare_digest(_hash_password(password), password_hash)

def _generate_api_key(
    tenant_id: str,
    label: str | None,
    db: Session,
    *,
    role: Optional[str] = None,
    agent_id: Optional[str] = None,
) -> tuple[str, ApiKey]:
    raw_key = f"st_{secrets.token_urlsafe(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:10]
    key_id = str(uuid.uuid4())
    api_key_record = ApiKey(
        id=key_id,
        hashed_key=hashed_key,
        tenant_id=tenant_id,
        label=label,
        role=role,
        agent_id=agent_id,
        key_prefix=key_prefix,
    )
    db.add(api_key_record)
    db.commit()
    db.refresh(api_key_record)
    return raw_key, api_key_record


class SignupRequest(BaseModel):
    email: str
    password: str
    project_name: str

class SignupResponse(BaseModel):
    tenant_id: str
    api_key: str
    label: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    tenant_id: str
    api_key: str

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


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    tenant_id = f"tenant_{uuid.uuid4().hex[:12]}"
    user = User(
        id=str(uuid.uuid4()),
        email=request.email,
        password_hash=_hash_password(request.password),
        tenant_id=tenant_id,
    )
    db.add(user)
    db.flush()
    label = f"Master Key ({request.email})"
    raw_key, _ = _generate_api_key(tenant_id, label, db)
    return SignupResponse(tenant_id=tenant_id, api_key=raw_key, label=label)


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not _verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    raw_key, _ = _generate_api_key(user.tenant_id, "Login session key", db)
    return LoginResponse(tenant_id=user.tenant_id, api_key=raw_key)


@router.get("/me")
def get_current_user(auth: AuthContext = Depends(get_auth_context)):
    return {"tenant_id": auth.tenant_id, "role": auth.role, "agent_id": auth.agent_id}


@router.post("/api-keys", response_model=CreateApiKeyResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    request: CreateApiKeyRequest,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
):
    label = request.label or "New API Key"
    raw_key, api_key_record = _generate_api_key(
        auth.tenant_id, label, db, role=request.role, agent_id=request.agent_id
    )
    return CreateApiKeyResponse(
        raw_key=raw_key,
        id=api_key_record.id,
        label=api_key_record.label,
        role=api_key_record.role,
        agent_id=api_key_record.agent_id,
    )


@router.get("/api-keys", response_model=list[ApiKeyResponse])
def list_api_keys(auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)):
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
            key_preview=f"{k.key_prefix}••••" if k.key_prefix else "st_••••••••••••••••",
        )
        for k in keys
    ]

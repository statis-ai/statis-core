"""OIDC/OAuth2 SSO integration — Okta and Azure Entra ID.

Enabled only when OIDC_ENABLED=true. Disabled by default.
See docs/sso-integration.md for setup instructions.
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User

router = APIRouter(tags=["auth-oidc"])

# ---------------------------------------------------------------------------
# Settings — read from environment
# ---------------------------------------------------------------------------
OIDC_ENABLED = os.getenv("OIDC_ENABLED", "false").lower() == "true"
OIDC_PROVIDER = os.getenv("OIDC_PROVIDER", "")  # "okta" | "entra"
OIDC_CLIENT_ID = os.getenv("OIDC_CLIENT_ID", "")
OIDC_CLIENT_SECRET = os.getenv("OIDC_CLIENT_SECRET", "")
OIDC_DISCOVERY_URL = os.getenv("OIDC_DISCOVERY_URL", "")
OIDC_REDIRECT_URI = os.getenv("OIDC_REDIRECT_URI", "")
# Where to redirect the browser after a successful SSO login
OIDC_POST_LOGIN_URL = os.getenv("OIDC_POST_LOGIN_URL", "https://console.statis.dev")


class OIDCConfigResponse(BaseModel):
    enabled: bool
    provider: str


@router.get("/auth/oidc/config", response_model=OIDCConfigResponse)
def oidc_config() -> OIDCConfigResponse:
    """Returns whether SSO is enabled and which provider. Used by the console to show/hide the SSO button."""
    return OIDCConfigResponse(enabled=OIDC_ENABLED, provider=OIDC_PROVIDER)


@router.get("/auth/oidc/login")
def oidc_login() -> RedirectResponse:
    """Redirect browser to IdP authorization URL."""
    if not OIDC_ENABLED:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SSO not enabled")

    try:
        from authlib.integrations.httpx_client import AsyncOAuth2Client  # type: ignore
        from authlib.integrations.requests_client import OAuth2Session  # type: ignore
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="authlib not installed. Add authlib to requirements.txt.",
        )

    metadata = _fetch_oidc_metadata()
    authorization_endpoint = metadata["authorization_endpoint"]

    session = OAuth2Session(
        client_id=OIDC_CLIENT_ID,
        redirect_uri=OIDC_REDIRECT_URI,
        scope="openid email profile",
    )
    url, _ = session.create_authorization_url(authorization_endpoint)
    return RedirectResponse(url=url)


@router.get("/auth/oidc/callback")
def oidc_callback(
    code: str,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    """Receive authorization code from IdP, exchange for tokens, upsert user, redirect to console."""
    if not OIDC_ENABLED:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SSO not enabled")

    try:
        from authlib.integrations.requests_client import OAuth2Session  # type: ignore
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="authlib not installed",
        )

    metadata = _fetch_oidc_metadata()
    token_endpoint = metadata["token_endpoint"]
    userinfo_endpoint = metadata["userinfo_endpoint"]

    session = OAuth2Session(
        client_id=OIDC_CLIENT_ID,
        client_secret=OIDC_CLIENT_SECRET,
        redirect_uri=OIDC_REDIRECT_URI,
    )

    token = session.fetch_token(token_endpoint, code=code)
    userinfo_resp = session.get(userinfo_endpoint)
    userinfo: dict[str, Any] = userinfo_resp.json()

    email: str = userinfo.get("email", "")
    sso_subject: str = userinfo.get("sub", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IdP did not return an email address",
        )

    # Upsert user
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash="",  # SSO users have no password
            tenant_id=str(uuid.uuid4()),
            sso_provider=OIDC_PROVIDER,
            sso_subject=sso_subject,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not getattr(user, "sso_provider", None):
            user.sso_provider = OIDC_PROVIDER  # type: ignore[attr-defined]
            user.sso_subject = sso_subject  # type: ignore[attr-defined]
            db.commit()

    # Issue a simple token for the console (re-use existing pattern if JWT is available)
    # For now: redirect with tenant_id as query param — console stores it
    # TODO: replace with proper JWT once auth middleware supports SSO tokens
    redirect_url = f"{OIDC_POST_LOGIN_URL}?sso=1&tenant_id={user.tenant_id}&email={email}"
    return RedirectResponse(url=redirect_url)


def _fetch_oidc_metadata() -> dict[str, Any]:
    """Fetch OIDC provider metadata from the discovery URL."""
    import urllib.request
    import json

    if not OIDC_DISCOVERY_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OIDC_DISCOVERY_URL is not configured",
        )
    try:
        with urllib.request.urlopen(OIDC_DISCOVERY_URL) as resp:
            return json.loads(resp.read())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch OIDC discovery metadata: {exc}",
        )

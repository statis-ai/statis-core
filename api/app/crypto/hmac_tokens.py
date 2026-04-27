"""HMAC tokens for action approval URLs.

A signed token is the bearer credential on `https://statis.dev/a/{action_id}?sig=…`.
Holding it is enough to render the approval page and (via POST) to flip the
action's status. Single-use semantics are enforced at the database layer with
the `actions.decided_via_token` UNIQUE column added in migration 0039 — this
module only handles signing and verification.

Token wire format

    v1.<b64u(payload)>.<b64u(sig)>

`payload` is sort-key compact JSON:

    {"act": "<action_id>", "tnt": "<tenant_id>", "iat": <unix>, "exp": <unix>, "n": "<nonce>"}

`sig` is HMAC-SHA256(signing_key, payload_bytes) where `signing_key` is the
per-tenant secret stored in `tenant_signing_keys.signing_key` (migration
0041). Verifier compares `iat` against `tenant_signing_keys.rotated_at` —
any token signed before the most recent rotation is rejected ("rotation =
revocation" — D2 rotation runbook).

Two clocks intentionally:

  * sync decorator timeout (`timeout_s`) — how long the agent BLOCKS before
    raising `ActionPending`. Lives in the SDK.
  * URL TTL (`exp - iat`) — how long the link remains clickable. Default
    1800s (30 min); max 86400s (24h). The URL can outlive the sync wait.

Failure shapes

  * `TokenInvalid` — malformed, bad signature, unknown tenant.
  * `TokenExpired` — `now > exp`.
  * `TokenRotated` — `iat < tenant.rotated_at`.

Callers translate these into the response shapes in
`api.contracts.approval` (INVALID-SIG-ERROR / EXPIRED-ERROR / ROTATED-ERROR).
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from dataclasses import dataclass
from typing import Final


SCHEME_PREFIX: Final[str] = "v1"
DEFAULT_TTL_SECONDS: Final[int] = 30 * 60
MAX_TTL_SECONDS: Final[int] = 24 * 60 * 60
NONCE_BYTES: Final[int] = 12


class TokenInvalid(Exception):
    """Token is malformed, has a bad signature, or references an unknown tenant."""


class TokenExpired(Exception):
    """Token's `exp` is in the past."""


class TokenRotated(Exception):
    """Token was signed before the tenant's most recent key rotation."""


@dataclass(frozen=True)
class TokenPayload:
    action_id: str
    tenant_id: str
    issued_at: int
    expires_at: int
    nonce: str


def _b64u_encode(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def _b64u_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _payload_bytes(p: TokenPayload) -> bytes:
    return json.dumps(
        {"act": p.action_id, "tnt": p.tenant_id, "iat": p.issued_at, "exp": p.expires_at, "n": p.nonce},
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def generate_signing_key() -> str:
    """32 random bytes, base64url-encoded. Use to seed `tenant_signing_keys.signing_key`."""
    return _b64u_encode(secrets.token_bytes(32))


def sign(
    *,
    action_id: str,
    tenant_id: str,
    signing_key: str,
    ttl_seconds: int = DEFAULT_TTL_SECONDS,
    now: int | None = None,
) -> str:
    if ttl_seconds <= 0 or ttl_seconds > MAX_TTL_SECONDS:
        raise ValueError(f"ttl_seconds must be in (0, {MAX_TTL_SECONDS}]")
    issued_at = int(now if now is not None else time.time())
    payload = TokenPayload(
        action_id=action_id,
        tenant_id=tenant_id,
        issued_at=issued_at,
        expires_at=issued_at + ttl_seconds,
        nonce=_b64u_encode(secrets.token_bytes(NONCE_BYTES)),
    )
    body = _payload_bytes(payload)
    sig = hmac.new(signing_key.encode("utf-8"), body, hashlib.sha256).digest()
    return f"{SCHEME_PREFIX}.{_b64u_encode(body)}.{_b64u_encode(sig)}"


def verify(
    *,
    token: str,
    signing_key: str,
    rotated_at_unix: int,
    now: int | None = None,
) -> TokenPayload:
    """Validate `token` and return the parsed payload.

    Raises `TokenInvalid` / `TokenExpired` / `TokenRotated`. The caller is
    responsible for the database CAS that enforces single-use consumption.
    """
    try:
        scheme, body_b64, sig_b64 = token.split(".")
    except ValueError as e:
        raise TokenInvalid("malformed token") from e
    if scheme != SCHEME_PREFIX:
        raise TokenInvalid(f"unknown scheme: {scheme}")
    try:
        body = _b64u_decode(body_b64)
        provided_sig = _b64u_decode(sig_b64)
    except Exception as e:
        raise TokenInvalid("base64 decode failed") from e
    expected_sig = hmac.new(signing_key.encode("utf-8"), body, hashlib.sha256).digest()
    if not hmac.compare_digest(provided_sig, expected_sig):
        raise TokenInvalid("signature mismatch")
    try:
        raw = json.loads(body)
        payload = TokenPayload(
            action_id=raw["act"],
            tenant_id=raw["tnt"],
            issued_at=int(raw["iat"]),
            expires_at=int(raw["exp"]),
            nonce=raw["n"],
        )
    except (KeyError, ValueError, TypeError) as e:
        raise TokenInvalid("payload shape") from e
    current = int(now if now is not None else time.time())
    if current > payload.expires_at:
        raise TokenExpired(f"expired at {payload.expires_at}, now {current}")
    if payload.issued_at < rotated_at_unix:
        raise TokenRotated(f"issued {payload.issued_at} < rotated {rotated_at_unix}")
    return payload

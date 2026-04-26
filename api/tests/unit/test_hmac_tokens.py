"""Spine — HMAC token sign/verify covering all failure shapes.

Maps to /plan-eng-review D2 (rotation = revocation), D5 (URL TTL lazy
check), OV5 (single-use semantics), F1 (prefetch burns token — the verify
side; consumption side lives in services.approval).

Each test names the failure mode it covers. Pure unit tests, no database.
"""
from __future__ import annotations

import time

import pytest

from app.crypto.hmac_tokens import (
    DEFAULT_TTL_SECONDS,
    MAX_TTL_SECONDS,
    TokenExpired,
    TokenInvalid,
    TokenRotated,
    generate_signing_key,
    sign,
    verify,
)


def _key() -> str:
    return generate_signing_key()


def test_round_trip_ok() -> None:
    key = _key()
    now = int(time.time())
    token = sign(action_id="act_1", tenant_id="tnt_a", signing_key=key, now=now)
    payload = verify(token=token, signing_key=key, rotated_at_unix=0, now=now + 10)
    assert payload.action_id == "act_1"
    assert payload.tenant_id == "tnt_a"
    assert payload.expires_at - payload.issued_at == DEFAULT_TTL_SECONDS


def test_default_ttl_is_thirty_minutes() -> None:
    """D5 — URL TTL default is 1800s (30 min); spec section §Approval URL Security."""
    assert DEFAULT_TTL_SECONDS == 30 * 60


def test_max_ttl_is_one_day() -> None:
    """Spec — URL TTL max is 24h."""
    assert MAX_TTL_SECONDS == 24 * 60 * 60


def test_ttl_zero_or_negative_raises() -> None:
    with pytest.raises(ValueError):
        sign(action_id="a", tenant_id="t", signing_key=_key(), ttl_seconds=0)
    with pytest.raises(ValueError):
        sign(action_id="a", tenant_id="t", signing_key=_key(), ttl_seconds=-1)


def test_ttl_above_max_raises() -> None:
    with pytest.raises(ValueError):
        sign(action_id="a", tenant_id="t", signing_key=_key(), ttl_seconds=MAX_TTL_SECONDS + 1)


def test_expired_token_rejected() -> None:
    """A token verified after its `exp` raises TokenExpired."""
    key = _key()
    now = int(time.time())
    token = sign(action_id="a", tenant_id="t", signing_key=key, ttl_seconds=60, now=now)
    with pytest.raises(TokenExpired):
        verify(token=token, signing_key=key, rotated_at_unix=0, now=now + 61)


def test_rotated_token_rejected() -> None:
    """D2 — rotation = revocation. iat < rotated_at must reject."""
    key = _key()
    now = int(time.time())
    token = sign(action_id="a", tenant_id="t", signing_key=key, now=now)
    with pytest.raises(TokenRotated):
        verify(token=token, signing_key=key, rotated_at_unix=now + 1, now=now + 5)


def test_tampered_payload_rejected() -> None:
    """OV5 / F1 — bit-flip on the payload must fail HMAC."""
    key = _key()
    token = sign(action_id="orig", tenant_id="t", signing_key=key)
    scheme, body, sig = token.split(".")
    # Re-encode the body with a different action_id; signature stays the same.
    bad_body = body[:-2] + ("AA" if body[-2:] != "AA" else "BB")
    bad_token = f"{scheme}.{bad_body}.{sig}"
    with pytest.raises(TokenInvalid):
        verify(token=bad_token, signing_key=key, rotated_at_unix=0)


def test_wrong_key_rejected() -> None:
    """Verify with a different tenant secret must fail."""
    key_a = _key()
    key_b = _key()
    token = sign(action_id="a", tenant_id="t", signing_key=key_a)
    with pytest.raises(TokenInvalid):
        verify(token=token, signing_key=key_b, rotated_at_unix=0)


def test_unknown_scheme_rejected() -> None:
    with pytest.raises(TokenInvalid):
        verify(token="v2.aaa.bbb", signing_key=_key(), rotated_at_unix=0)


def test_malformed_token_rejected() -> None:
    with pytest.raises(TokenInvalid):
        verify(token="not-a-token", signing_key=_key(), rotated_at_unix=0)


def test_garbage_after_split_rejected() -> None:
    """Three parts but invalid base64 in the middle."""
    with pytest.raises(TokenInvalid):
        verify(token="v1.@@@.bbb", signing_key=_key(), rotated_at_unix=0)


def test_nonce_makes_each_token_unique() -> None:
    """Two signs of the same (action, tenant, key, now) still differ thanks to nonce."""
    key = _key()
    now = int(time.time())
    a = sign(action_id="x", tenant_id="t", signing_key=key, now=now)
    b = sign(action_id="x", tenant_id="t", signing_key=key, now=now)
    assert a != b

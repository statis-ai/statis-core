"""AARM R5 — public-key discovery endpoint.

Serves `/.well-known/aarm-pubkey` with the active Ed25519 public key so any
third party can verify a receipt's signature offline without needing
an API key. This is the primary proof artifact for AARM R5:

  * No authentication — this is public-key material by design.
  * Cache-friendly — keys rotate rarely; Cache-Control allows 1h caching.
  * Ships the `keys` array shape from day one so future rotation does not
    break clients that expect a single key.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Response, status

from app.crypto import (
    SIGNATURE_ALG,
    KeyNotConfiguredError,
    active_public_key_pem,
    get_active_key_id,
)

# No tags — this router lives outside the main API surface. Register it
# without a `/v1` prefix so the URL is literally `/.well-known/aarm-pubkey`.
router = APIRouter()


@router.get("/.well-known/aarm-pubkey")
def aarm_pubkey(response: Response) -> dict[str, Any]:
    """Return the active AARM signing public key(s) in a versioned envelope.

    Response shape::

        {
          "v": 1,
          "spec": "https://arxiv.org/abs/2602.09433",
          "active": "stat-ed25519-dev",
          "keys": [
            {
              "kid": "stat-ed25519-dev",
              "alg": "ed25519-v1",
              "public_key_pem": "-----BEGIN PUBLIC KEY-----\\n..."
            }
          ]
        }

    AARM R5: receipts reference `public_key_id` (= kid), verifiers fetch
    this endpoint, pull the matching entry from `keys`, and verify the
    receipt's Ed25519 signature locally. Key rotation (multiple entries
    in `keys` with one marked `active`) is supported by this shape but
    not yet surfaced — follow-up PR.
    """
    try:
        kid = get_active_key_id()
        pem = active_public_key_pem()
    except KeyNotConfiguredError as exc:
        # Fail closed — a receipt without a public key cannot be verified.
        # Returning 503 tells callers to back off rather than caching a
        # "no keys available" response.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    response.headers["Cache-Control"] = "public, max-age=3600"

    return {
        "v": 1,
        "spec": "https://arxiv.org/abs/2602.09433",
        "active": kid,
        "keys": [
            {
                "kid": kid,
                "alg": SIGNATURE_ALG,
                "public_key_pem": pem,
            }
        ],
    }

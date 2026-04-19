"""AARM R5 conformance — tamper-evident Ed25519 receipt signing.

Spec: arxiv:2602.09433 §VII.B.R5 —
  "The system MUST generate cryptographically signed receipts for all
  actions.
  Receipts MUST contain: Action, Context, Identity, Decision+policy+reason,
  Approval (if applicable), Deferral (if applicable), Outcome, Signature.
  Signature requirements: Use secure algorithm (Ed25519, ECDSA P-256, or
  RSA-2048 minimum); Sign canonical serialization of receipt contents;
  Public keys available for offline verification."

PR-AARM-02 lands Ed25519 signing + the /.well-known/aarm-pubkey endpoint.
PR-AARM-03 will add identity binding (R6), PR-AARM-05 adds approval /
deferral receipt blocks (R4 full).

Each test docstring cites the clause it verifies.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

import pytest

from app.crypto import (
    DEFAULT_KEY_ID,
    SIGNATURE_ALG,
    SIGNING_SCHEMA_VERSION,
    KeyNotConfiguredError,
    active_public_key_pem,
    canonical_signing_payload,
    generate_keypair_pem,
    get_active_key_id,
    load_active_keypair,
    sign_receipt_payload,
    verify_receipt_signature,
)


@pytest.fixture(autouse=True)
def _isolate_env_and_cache(monkeypatch):
    """Each test gets a fresh keypair loaded from env.

    load_active_keypair is lru_cached for process lifetime, so we clear
    the cache before and after each test to keep tests hermetic.
    """
    load_active_keypair.cache_clear()
    priv_pem, _ = generate_keypair_pem()
    monkeypatch.setenv("STATIS_SIGNING_PRIVATE_KEY", priv_pem)
    monkeypatch.setenv("STATIS_SIGNING_KEY_ID", "stat-ed25519-test")
    yield
    load_active_keypair.cache_clear()


def _sample_payload(**overrides):
    kwargs = dict(
        receipt_id="r_fixed_1",
        action_id="a_fixed_1",
        decision="APPROVED",
        rule_id="rule_a",
        rule_version="1.0",
        hash_hex="deadbeef" * 8,
        created_at_iso="2026-04-19T00:00:00+00:00",
        public_key_id="stat-ed25519-test",
    )
    kwargs.update(overrides)
    return canonical_signing_payload(**kwargs)


class TestR5CanonicalPayload:
    """The signing payload MUST be deterministic across runs and
    implementations, because third parties verify offline."""

    def test_r5_schema_version_is_pinned(self) -> None:
        payload = _sample_payload()
        assert payload.as_dict["v"] == SIGNING_SCHEMA_VERSION == 1

    def test_r5_payload_is_deterministic(self) -> None:
        """Spec R5 'Sign canonical serialization of receipt contents'."""
        a = _sample_payload()
        b = _sample_payload()
        assert a.bytes_ == b.bytes_

    def test_r5_payload_includes_required_fields(self) -> None:
        payload = _sample_payload()
        for field in (
            "v",
            "receipt_id",
            "action_id",
            "decision",
            "rule_id",
            "rule_version",
            "hash",
            "created_at",
            "public_key_id",
        ):
            assert field in payload.as_dict, f"canonical payload missing {field}"

    def test_r5_payload_changes_when_any_field_changes(self) -> None:
        base = _sample_payload().bytes_
        for field in ("decision", "rule_id", "hash_hex", "action_id"):
            mutated = _sample_payload(**{field: "DIFFERENT"})
            assert mutated.bytes_ != base, (
                f"mutating {field} did not change canonical bytes; "
                "signature would not catch this tamper"
            )


class TestR5SignAndVerifyRoundtrip:
    """Round-trip sign → verify must succeed with the active key."""

    def test_r5_signature_verifies_with_active_pubkey(self) -> None:
        """Spec R5 'Public keys available for offline verification'."""
        payload = _sample_payload()
        signature = sign_receipt_payload(payload)
        pub_pem = active_public_key_pem()
        assert verify_receipt_signature(payload, signature, pub_pem) is True

    def test_r5_signature_is_base64url(self) -> None:
        signature = sign_receipt_payload(_sample_payload())
        # base64url — no +/ characters, no padding
        assert "+" not in signature
        assert "/" not in signature
        assert "=" not in signature

    def test_r5_signature_fails_on_tampered_decision(self) -> None:
        """Tamper-evidence: flipping APPROVED → DENIED must invalidate."""
        good_payload = _sample_payload(decision="APPROVED")
        signature = sign_receipt_payload(good_payload)
        bad_payload = _sample_payload(decision="DENIED")
        pub_pem = active_public_key_pem()
        assert verify_receipt_signature(bad_payload, signature, pub_pem) is False

    def test_r5_signature_fails_on_tampered_hash(self) -> None:
        good_payload = _sample_payload(hash_hex="a" * 64)
        signature = sign_receipt_payload(good_payload)
        bad_payload = _sample_payload(hash_hex="b" * 64)
        pub_pem = active_public_key_pem()
        assert verify_receipt_signature(bad_payload, signature, pub_pem) is False

    def test_r5_signature_fails_on_wrong_pubkey(self) -> None:
        """Signing with key A, verifying with key B must return False."""
        payload = _sample_payload()
        signature = sign_receipt_payload(payload)
        _, other_pub_pem = generate_keypair_pem()
        assert verify_receipt_signature(payload, signature, other_pub_pem) is False


class TestR5KeyLoading:
    def test_r5_raises_when_private_key_missing(self, monkeypatch) -> None:
        load_active_keypair.cache_clear()
        monkeypatch.delenv("STATIS_SIGNING_PRIVATE_KEY", raising=False)
        with pytest.raises(KeyNotConfiguredError):
            load_active_keypair()

    def test_r5_raises_on_malformed_pem(self, monkeypatch) -> None:
        load_active_keypair.cache_clear()
        monkeypatch.setenv("STATIS_SIGNING_PRIVATE_KEY", "not a pem")
        with pytest.raises(KeyNotConfiguredError):
            load_active_keypair()

    def test_r5_default_key_id_used_when_env_unset(self, monkeypatch) -> None:
        monkeypatch.delenv("STATIS_SIGNING_KEY_ID", raising=False)
        assert get_active_key_id() == DEFAULT_KEY_ID

    def test_r5_signature_alg_is_ed25519_v1(self) -> None:
        assert SIGNATURE_ALG == "ed25519-v1"


class TestR5WellKnownEndpoint:
    """Spec R5 — public keys must be fetchable for offline verification,
    which means no authentication required on the discovery endpoint."""

    def test_r5_well_known_pubkey_no_auth(self) -> None:
        """GET /.well-known/aarm-pubkey with no API key → 200."""
        from fastapi.testclient import TestClient

        # Force production-like config off so the CORS guard doesn't
        # raise; well-known endpoint has no auth.
        os.environ.setdefault("APP_ENV", "development")

        from app.main import app

        client = TestClient(app)
        resp = client.get("/.well-known/aarm-pubkey")
        assert resp.status_code == 200, resp.text

        body = resp.json()
        assert body["v"] == 1
        assert body["spec"].startswith("https://arxiv.org/abs/")
        assert body["active"] == "stat-ed25519-test"
        assert len(body["keys"]) >= 1
        active_key = next(
            k for k in body["keys"] if k["kid"] == "stat-ed25519-test"
        )
        assert active_key["alg"] == SIGNATURE_ALG
        assert "-----BEGIN PUBLIC KEY-----" in active_key["public_key_pem"]

    def test_r5_well_known_pubkey_is_cacheable(self) -> None:
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        resp = client.get("/.well-known/aarm-pubkey")
        assert resp.status_code == 200
        assert "Cache-Control" in resp.headers
        assert "max-age=" in resp.headers["Cache-Control"]

    def test_r5_well_known_503_when_key_missing(self, monkeypatch) -> None:
        """Fail-closed: if no signing key is configured, the endpoint
        returns 503 rather than a cacheable 'no keys' response."""
        load_active_keypair.cache_clear()
        monkeypatch.delenv("STATIS_SIGNING_PRIVATE_KEY", raising=False)

        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        resp = client.get("/.well-known/aarm-pubkey")
        assert resp.status_code == 503


class TestR5SDKVerification:
    """The Python SDK's verify_receipt_offline must produce the same
    verdict as the API's internal verify_receipt_signature."""

    def test_r5_sdk_verify_matches_api_for_valid_signature(self) -> None:
        from statis._crypto import verify_receipt_offline
        from statis._models import Receipt

        payload = _sample_payload()
        signature = sign_receipt_payload(payload)
        pub_pem = active_public_key_pem()

        receipt = Receipt(
            receipt_id="r_fixed_1",
            action_id="a_fixed_1",
            decision="APPROVED",
            rule_id="rule_a",
            rule_version="1.0",
            approved_by="policy_engine",
            conditions_evaluated=None,
            execution_result=None,
            executed_at=None,
            hash="deadbeef" * 8,
            created_at=datetime(2026, 4, 19, 0, 0, 0, tzinfo=timezone.utc),
            signature=signature,
            signature_alg=SIGNATURE_ALG,
            public_key_id="stat-ed25519-test",
        )
        result = verify_receipt_offline(
            receipt=receipt, public_key_pem=pub_pem
        )
        assert result.valid is True, result.reason

    def test_r5_sdk_verify_rejects_unsigned_receipt(self) -> None:
        """Legacy receipts (signature=None) must return valid=False
        rather than a silent pass."""
        from statis._crypto import verify_receipt_offline
        from statis._models import Receipt

        receipt = Receipt(
            receipt_id="legacy_1",
            action_id="legacy_action",
            decision="APPROVED",
            rule_id=None,
            rule_version=None,
            approved_by="policy_engine",
            conditions_evaluated=None,
            execution_result=None,
            executed_at=None,
            hash="0" * 64,
            created_at=datetime(2026, 4, 1, 0, 0, 0, tzinfo=timezone.utc),
        )
        result = verify_receipt_offline(
            receipt=receipt, public_key_pem=active_public_key_pem()
        )
        assert result.valid is False
        assert "legacy" in (result.reason or "").lower() or "unsigned" in (
            result.reason or ""
        ).lower()

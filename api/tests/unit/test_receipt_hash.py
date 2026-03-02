"""Unit tests for receipt canonical hash.

Pure Python — no DB, no fixtures.
Verifies the hash function properties that the receipt audit trail depends on.
"""
from datetime import datetime, timezone

import pytest

from app.utils.hashing import canonical_state_hash


def _canonical(
    receipt_id: str = "rec-001",
    action_id: str = "act-001",
    decision: str = "APPROVED",
    rule_id: str | None = "churn_retention_v1",
    rule_version: str | None = "1.0",
    approved_by: str = "policy_engine",
    executed_at: datetime | None = None,
    execution_result: dict | None = None,
    created_at: str = "2026-02-28T00:00:00+00:00",
) -> dict:
    return {
        "receipt_id": receipt_id,
        "action_id": action_id,
        "decision": decision,
        "rule_id": rule_id,
        "rule_version": rule_version,
        "approved_by": approved_by,
        "executed_at": executed_at.isoformat() if executed_at else None,
        "execution_result": execution_result,
        "created_at": created_at,
    }


class TestReceiptHash:
    def test_hash_is_deterministic(self) -> None:
        """Same inputs always produce the same hash."""
        d = _canonical()
        assert canonical_state_hash(d) == canonical_state_hash(d)

    def test_hash_is_hex_string(self) -> None:
        """Hash output is a 64-char lowercase hex string (SHA-256)."""
        h = canonical_state_hash(_canonical())
        assert len(h) == 64
        assert all(c in "0123456789abcdef" for c in h)

    def test_different_decisions_produce_different_hashes(self) -> None:
        """APPROVED and DENIED receipts must not share a hash."""
        h_approved = canonical_state_hash(_canonical(decision="APPROVED"))
        h_denied = canonical_state_hash(_canonical(decision="DENIED"))
        assert h_approved != h_denied

    def test_different_action_ids_produce_different_hashes(self) -> None:
        h1 = canonical_state_hash(_canonical(action_id="act-001"))
        h2 = canonical_state_hash(_canonical(action_id="act-002"))
        assert h1 != h2

    def test_different_receipt_ids_produce_different_hashes(self) -> None:
        h1 = canonical_state_hash(_canonical(receipt_id="rec-001"))
        h2 = canonical_state_hash(_canonical(receipt_id="rec-002"))
        assert h1 != h2

    def test_null_rule_id_is_hashable(self) -> None:
        """DENIED receipts have no rule_id — None must serialize cleanly."""
        d = _canonical(decision="DENIED", rule_id=None, rule_version=None)
        h = canonical_state_hash(d)
        assert len(h) == 64

    def test_key_order_does_not_affect_hash(self) -> None:
        """canonical_state_hash sorts keys; insertion order is irrelevant."""
        d1 = _canonical()
        # Rebuild with different insertion order
        d2 = {k: d1[k] for k in reversed(list(d1.keys()))}
        assert canonical_state_hash(d1) == canonical_state_hash(d2)

    def test_hash_changes_when_created_at_differs(self) -> None:
        """Timestamp is part of the canonical representation."""
        h1 = canonical_state_hash(_canonical(created_at="2026-02-28T00:00:00+00:00"))
        h2 = canonical_state_hash(_canonical(created_at="2026-02-28T00:00:01+00:00"))
        assert h1 != h2

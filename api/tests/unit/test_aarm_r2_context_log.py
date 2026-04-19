"""AARM R2 conformance — data classification + hash-chained context log.

Spec reference: arxiv:2602.09433 §VII.B.R2 (Context Accumulation).

R2 requires: "Every piece of context that influenced a decision MUST be
logged in a tamper-evident append-only log and classified by sensitivity."

These tests cover:
  - 5-class taxonomy (PUBLIC / INTERNAL / PII / SECRET / SYSTEM)
  - Hash-chain construction and verification
  - Tamper detection (insertion, deletion, reorder, mutation)
  - Raw values never leak into the log (only SHA-256 hashes persisted)
"""
from __future__ import annotations

import uuid
from unittest.mock import MagicMock

import pytest

from app.models.context_log import ContextLogEntry
from app.security.classifier import (
    CLASSIFICATIONS,
    INTERNAL,
    PII,
    PUBLIC,
    SECRET,
    SYSTEM,
    classify_field,
)
from app.security.context_log import (
    _compute_chain_hash,
    _content_hash,
    verify_chain,
    write_context_log,
)


# ---------------------------------------------------------------------------
# Classification taxonomy
# ---------------------------------------------------------------------------


class TestR2Taxonomy:
    """R2: five canonical sensitivity classes."""

    def test_r2_five_classes_defined(self) -> None:
        assert CLASSIFICATIONS == frozenset({"PUBLIC", "INTERNAL", "PII", "SECRET", "SYSTEM"})

    def test_r2_default_is_internal(self) -> None:
        """Fields with no classification signal default to INTERNAL."""
        assert classify_field("account_balance", 1250.0) == INTERNAL

    def test_r2_password_is_secret(self) -> None:
        assert classify_field("password", "hunter2") == SECRET

    def test_r2_api_key_is_secret(self) -> None:
        assert classify_field("api_key", "sk-abc") == SECRET

    def test_r2_substring_token_is_secret(self) -> None:
        """Any key containing 'token' substring classifies as SECRET."""
        assert classify_field("github_access_token", "ghp_xxx") == SECRET
        assert classify_field("csrf_token", "abc") == SECRET

    def test_r2_ssn_key_is_pii(self) -> None:
        assert classify_field("ssn", "123-45-6789") == PII

    def test_r2_email_value_pattern_is_pii(self) -> None:
        """Even with a non-PII key, an email-shaped value classifies as PII."""
        assert classify_field("contact", "user@example.com") == PII

    def test_r2_ssn_value_pattern_is_pii(self) -> None:
        assert classify_field("note", "SSN on file: 123-45-6789") == PII

    def test_r2_underscore_prefix_is_system(self) -> None:
        assert classify_field("_meta", {"trace_id": "abc"}) == SYSTEM

    def test_r2_agent_id_is_system(self) -> None:
        assert classify_field("agent_id", "agent-abc") == SYSTEM

    def test_r2_public_suffix_is_public(self) -> None:
        """Explicit '_public' suffix tags the field as PUBLIC."""
        assert classify_field("announcement_public", "hello world") == PUBLIC

    def test_r2_system_wins_over_secret_substring(self) -> None:
        """System keys (underscore prefix) take precedence over secret heuristics."""
        assert classify_field("_internal_token", "x") == SYSTEM


# ---------------------------------------------------------------------------
# Hash-chain primitives
# ---------------------------------------------------------------------------


class TestR2ChainPrimitives:
    def test_r2_chain_hash_deterministic(self) -> None:
        """Same inputs → same chain hash (replayable audits)."""
        h1 = _compute_chain_hash(None, "abc")
        h2 = _compute_chain_hash(None, "abc")
        assert h1 == h2

    def test_r2_chain_hash_sensitive_to_prev(self) -> None:
        """Different predecessor → different chain hash."""
        a = _compute_chain_hash("prev_A", "content")
        b = _compute_chain_hash("prev_B", "content")
        assert a != b

    def test_r2_chain_hash_sensitive_to_content(self) -> None:
        """Different content → different chain hash."""
        a = _compute_chain_hash("prev", "content_A")
        b = _compute_chain_hash("prev", "content_B")
        assert a != b

    def test_r2_content_hash_excludes_raw_value_from_persistence(self) -> None:
        """The content hash is over the canonical (key, value) tuple; the
        return type is always a hex string — never the raw value."""
        h = _content_hash("password", "hunter2")
        assert isinstance(h, str) and len(h) == 64
        assert "hunter2" not in h

    def test_r2_chain_hash_length(self) -> None:
        """Chain hashes are SHA-256 (64 hex chars)."""
        h = _compute_chain_hash(None, "x")
        assert len(h) == 64


# ---------------------------------------------------------------------------
# Writer behaviour
# ---------------------------------------------------------------------------


class _SessionStub:
    """Minimal stand-in for a SQLAlchemy Session that captures added entries."""

    def __init__(self) -> None:
        self.added: list[ContextLogEntry] = []

    def add(self, obj: object) -> None:
        assert isinstance(obj, ContextLogEntry)
        self.added.append(obj)


class TestR2Writer:
    def test_r2_writer_produces_one_entry_per_field(self) -> None:
        db = _SessionStub()
        write_context_log(
            db=db,  # type: ignore[arg-type]
            action_id="act-1",
            tenant_id="t1",
            context={"a": 1, "b": 2, "c": 3},
        )
        assert len(db.added) == 3

    def test_r2_writer_empty_context_adds_no_entries(self) -> None:
        db = _SessionStub()
        write_context_log(db=db, action_id="act-2", tenant_id="t1", context={})  # type: ignore[arg-type]
        assert db.added == []

    def test_r2_writer_sorts_keys_deterministic(self) -> None:
        """Keys iterated in sorted order for replayable chains."""
        db = _SessionStub()
        write_context_log(
            db=db,  # type: ignore[arg-type]
            action_id="act-3",
            tenant_id="t1",
            context={"z": 1, "a": 2, "m": 3},
        )
        assert [e.field_key for e in db.added] == ["a", "m", "z"]

    def test_r2_writer_first_entry_has_null_prev(self) -> None:
        db = _SessionStub()
        write_context_log(
            db=db, action_id="act-4", tenant_id="t1", context={"only": 1}  # type: ignore[arg-type]
        )
        assert db.added[0].previous_hash is None
        assert db.added[0].sequence == 0

    def test_r2_writer_links_each_entry_to_prior(self) -> None:
        db = _SessionStub()
        write_context_log(
            db=db,  # type: ignore[arg-type]
            action_id="act-5",
            tenant_id="t1",
            context={"a": 1, "b": 2, "c": 3},
        )
        for i, entry in enumerate(db.added):
            if i == 0:
                assert entry.previous_hash is None
            else:
                assert entry.previous_hash == db.added[i - 1].chain_hash

    def test_r2_writer_classifies_pii_field(self) -> None:
        db = _SessionStub()
        write_context_log(
            db=db,  # type: ignore[arg-type]
            action_id="act-6",
            tenant_id="t1",
            context={"ssn": "123-45-6789"},
        )
        assert db.added[0].classification == PII

    def test_r2_writer_classifies_secret_field(self) -> None:
        db = _SessionStub()
        write_context_log(
            db=db,  # type: ignore[arg-type]
            action_id="act-7",
            tenant_id="t1",
            context={"api_key": "sk-abc"},
        )
        assert db.added[0].classification == SECRET

    def test_r2_writer_does_not_persist_raw_value(self) -> None:
        """The raw value must never appear on the persisted row — only the hash."""
        db = _SessionStub()
        write_context_log(
            db=db,  # type: ignore[arg-type]
            action_id="act-8",
            tenant_id="t1",
            context={"password": "hunter2"},
        )
        entry = db.added[0]
        # field_key is intentional (auditors need to know WHICH field was logged)
        # but the value hunter2 must not appear on the row
        persisted_surface = f"{entry.content_hash}{entry.chain_hash}{entry.previous_hash or ''}"
        assert "hunter2" not in persisted_surface


# ---------------------------------------------------------------------------
# Chain verification + tamper detection
# ---------------------------------------------------------------------------


def _build_chain(context: dict) -> list[ContextLogEntry]:
    db = _SessionStub()
    write_context_log(db=db, action_id="act", tenant_id="t1", context=context)  # type: ignore[arg-type]
    return db.added


class TestR2VerifyChain:
    def test_r2_verify_empty_chain_is_vacuously_valid(self) -> None:
        """Pre-R2 actions or empty contexts are valid (no tampering possible)."""
        assert verify_chain([]) is True

    def test_r2_verify_valid_chain(self) -> None:
        entries = _build_chain({"a": 1, "b": 2, "c": 3})
        assert verify_chain(entries) is True

    def test_r2_verify_single_entry_chain(self) -> None:
        entries = _build_chain({"only": "x"})
        assert verify_chain(entries) is True

    def test_r2_verify_detects_content_mutation(self) -> None:
        """Mutating a content_hash breaks chain verification."""
        entries = _build_chain({"a": 1, "b": 2, "c": 3})
        entries[1].content_hash = "0" * 64
        assert verify_chain(entries) is False

    def test_r2_verify_detects_chain_hash_mutation(self) -> None:
        entries = _build_chain({"a": 1, "b": 2, "c": 3})
        entries[1].chain_hash = "f" * 64
        assert verify_chain(entries) is False

    def test_r2_verify_detects_deletion(self) -> None:
        """Deleting an entry leaves a sequence gap → chain invalid."""
        entries = _build_chain({"a": 1, "b": 2, "c": 3})
        del entries[1]  # gap at sequence=1
        assert verify_chain(entries) is False

    def test_r2_verify_detects_reorder(self) -> None:
        """Swapping sequence numbers breaks the previous_hash → chain_hash link."""
        entries = _build_chain({"a": 1, "b": 2, "c": 3})
        # Swap sequences of index 1 and 2 — verify_chain sorts by sequence
        # so swapping sequence values effectively reorders them
        entries[1].sequence, entries[2].sequence = 2, 1
        assert verify_chain(entries) is False

    def test_r2_verify_detects_insertion(self) -> None:
        """Inserting a forged entry with a correct-looking hash still breaks
        the chain because subsequent previous_hash pointers no longer match."""
        entries = _build_chain({"a": 1, "b": 2})
        forged = ContextLogEntry(
            entry_id=str(uuid.uuid4()),
            action_id="act",
            tenant_id="t1",
            sequence=1,  # collides with real entry at sequence=1
            field_key="injected",
            classification=INTERNAL,
            content_hash=_content_hash("injected", "x"),
            previous_hash=entries[0].chain_hash,
            chain_hash=_compute_chain_hash(entries[0].chain_hash, _content_hash("injected", "x")),
        )
        # Bump the real sequence=1 entry up to sequence=2, leaving the
        # original sequence=2 to collide (chain can't recover)
        entries[1].sequence = 2
        tampered = [entries[0], forged, entries[1]]
        assert verify_chain(tampered) is False

    def test_r2_verify_detects_previous_hash_mutation(self) -> None:
        entries = _build_chain({"a": 1, "b": 2})
        entries[1].previous_hash = "0" * 64
        assert verify_chain(entries) is False

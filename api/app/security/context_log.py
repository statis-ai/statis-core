"""AARM R2 — context log writer + chain verifier.

Writer: called from propose_action after the ActionContract is committed.
Verifier: called from GET /actions/{id}/context-log to check chain integrity.

The chain-hash construction: SHA-256 over ``(previous_hash || ':' || content_hash)``
(empty string for the root entry). Tampering — insertion, deletion, reorder,
or value change — breaks the chain at the affected entry.
"""
from __future__ import annotations

import hashlib
import uuid
from typing import Any, Iterable

from sqlalchemy.orm import Session

from app.models.context_log import ContextLogEntry
from app.security.classifier import classify_field
from app.utils.hashing import canonical_state_hash


def _compute_chain_hash(previous_hash: str | None, content_hash: str) -> str:
    """SHA-256 of ``(previous_hash || ':' || content_hash)``.

    ``previous_hash`` is the empty string for the root entry (sequence 0).
    The separator byte prevents ambiguity between concatenated hex strings.
    """
    prev = previous_hash or ""
    return hashlib.sha256(f"{prev}:{content_hash}".encode("utf-8")).hexdigest()


def _content_hash(key: str, value: Any) -> str:
    """Canonical SHA-256 of a single key/value pair. Raw value is NOT persisted."""
    return canonical_state_hash({"key": key, "value": value})


def write_context_log(
    db: Session,
    action_id: str,
    tenant_id: str,
    context: dict[str, Any],
) -> list[ContextLogEntry]:
    """Write one ContextLogEntry per top-level field in ``context``.

    Entries are appended to the session but NOT committed — the caller is
    responsible for commit. Keys are iterated in sorted order for deterministic
    chains across replays.

    Returns the list of entries added (in sequence order).
    """
    entries: list[ContextLogEntry] = []
    previous_hash: str | None = None
    for seq, key in enumerate(sorted(context.keys())):
        value = context[key]
        c_hash = _content_hash(key, value)
        ch_hash = _compute_chain_hash(previous_hash, c_hash)
        entry = ContextLogEntry(
            entry_id=str(uuid.uuid4()),
            action_id=action_id,
            tenant_id=tenant_id,
            sequence=seq,
            field_key=key,
            classification=classify_field(key, value),
            content_hash=c_hash,
            previous_hash=previous_hash,
            chain_hash=ch_hash,
        )
        db.add(entry)
        entries.append(entry)
        previous_hash = ch_hash
    return entries


def verify_chain(entries: Iterable[ContextLogEntry]) -> bool:
    """Return True if *entries* form an unbroken AARM R2 chain.

    Checks: (a) sequence numbers are 0..N-1 with no gaps; (b) the first
    entry's previous_hash is NULL; (c) every other entry's previous_hash
    equals the prior entry's chain_hash; (d) every chain_hash is consistent
    with the recomputed SHA-256.
    """
    ordered = sorted(entries, key=lambda e: e.sequence)
    expected_prev: str | None = None
    for idx, entry in enumerate(ordered):
        if entry.sequence != idx:
            return False
        if entry.previous_hash != expected_prev:
            return False
        recomputed = _compute_chain_hash(entry.previous_hash, entry.content_hash)
        if recomputed != entry.chain_hash:
            return False
        expected_prev = entry.chain_hash
    return True

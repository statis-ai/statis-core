import hashlib
import json


def canonical_state_hash(state: dict) -> str:
    """SHA-256 of canonical (sorted-key, compact) JSON representation."""
    canonical = json.dumps(state, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

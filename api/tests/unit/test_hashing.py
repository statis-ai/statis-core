from app.utils.hashing import canonical_state_hash


def test_stable_output_regardless_of_key_order() -> None:
    a = {"z": 1, "a": 2, "m": 3}
    b = {"a": 2, "m": 3, "z": 1}
    assert canonical_state_hash(a) == canonical_state_hash(b)


def test_different_states_produce_different_hashes() -> None:
    assert canonical_state_hash({"x": 1}) != canonical_state_hash({"x": 2})


def test_empty_state_is_deterministic() -> None:
    h1 = canonical_state_hash({})
    h2 = canonical_state_hash({})
    assert h1 == h2
    assert len(h1) == 64  # sha256 hex length

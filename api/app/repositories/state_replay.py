"""Replay events through reducers to compute state at a given revision.

This is used by the time-machine endpoint and the rebuild-from-scratch test.
The core function is pure: given an ordered list of events, it replays them
through the reducer registry and returns intermediate or final state.
"""

from typing import List, Tuple

from app.models.event import Event
from app.reducers.registry import get_reducer, has_reducer
from app.utils.hashing import canonical_state_hash


def compute_state_at_rev(
    events: List[Event], target_rev: int
) -> Tuple[dict, str, List[str]]:
    """Replay *events* through reducers, stopping after *target_rev* state-changing events.

    Returns ``(state, state_hash, provenance_event_ids)`` at that revision.

    Raises ``ValueError`` if *target_rev* < 1 or if fewer than *target_rev*
    state-changing events are found in *events*.
    """
    if target_rev < 1:
        raise ValueError(f"target_rev must be >= 1, got {target_rev}")

    state: dict = {}
    provenance: List[str] = []
    applied = 0

    for event in events:
        if not has_reducer(event.event_type):
            continue

        reducer = get_reducer(event.event_type)
        state = reducer(state, event)
        provenance.append(event.event_id)
        applied += 1

        if applied == target_rev:
            return state, canonical_state_hash(state), list(provenance)

    raise ValueError(
        f"Only {applied} state-changing events found, but target_rev={target_rev}"
    )


def replay_all(events: List[Event]) -> List[Tuple[int, dict, str, List[str]]]:
    """Replay all events and return ``(rev, state, state_hash, provenance)`` per revision.

    Useful for the rebuild-from-scratch determinism test.
    """
    state: dict = {}
    provenance: List[str] = []
    snapshots: List[Tuple[int, dict, str, List[str]]] = []
    rev = 0

    for event in events:
        if not has_reducer(event.event_type):
            continue

        reducer = get_reducer(event.event_type)
        state = reducer(state, event)
        provenance.append(event.event_id)
        rev += 1
        snapshots.append((rev, dict(state), canonical_state_hash(state), list(provenance)))

    return snapshots

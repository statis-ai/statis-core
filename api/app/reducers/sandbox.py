"""Reducer sandboxing: timeout protection and error wrapping for reducer execution."""
from __future__ import annotations

import concurrent.futures
from typing import Any, Callable


class ReducerError(Exception):
    """Raised when a reducer function throws an exception."""


class ReducerTimeoutError(ReducerError):
    """Raised when a reducer function exceeds its time budget."""


def run_reducer_safely(
    reducer_fn: Callable[[dict, Any], dict],
    old_state: dict,
    event: Any,
    timeout_seconds: float = 5.0,
) -> dict:
    """Execute *reducer_fn(old_state, event)* with a hard timeout.

    Returns the new state dict on success.
    Raises ReducerTimeoutError if the reducer exceeds *timeout_seconds*.
    Raises ReducerError if the reducer throws any other exception.
    """
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(reducer_fn, old_state, event)
        try:
            return future.result(timeout=timeout_seconds)
        except concurrent.futures.TimeoutError:
            raise ReducerTimeoutError(
                f"Reducer timed out after {timeout_seconds}s"
            )
        except (ReducerError, ReducerTimeoutError):
            raise
        except Exception as exc:
            raise ReducerError(
                f"Reducer raised {type(exc).__name__}: {exc}"
            ) from exc

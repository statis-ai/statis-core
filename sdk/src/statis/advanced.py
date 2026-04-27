"""statis.advanced — lower-level propose/execute API.

This submodule hosts the v0.1.x ``StatisClient`` interface. Use it when
``@statis.gate`` doesn't fit your case:

- You need fine-grained control over polling cadence
- You want to read receipts directly without going through a decorated function
- You are migrating an existing v0.1.x codebase and want a minimum-change path
- You are wrapping Statis inside another framework and need lower-level hooks

For new code, prefer ``@statis.gate`` (see ``statis.decorator``). The decorator
is shorter, more idiomatic, and writes receipts automatically.

Migration from v0.1.x: see ``MIGRATION.md`` at the repo root.
"""

from ._models import (
    ActionDeferredError,
    ActionDeniedError,
    ActionEscalatedError,
    ActionTimeoutError,
    Receipt,
    StatisActionDenied,
    StatisActionEscalated,
    StatisError,
)
from .client import StatisClient

__all__ = [
    "StatisClient",
    "Receipt",
    "StatisError",
    "ActionDeniedError",
    "ActionEscalatedError",
    "ActionTimeoutError",
    "ActionDeferredError",
    "StatisActionDenied",
    "StatisActionEscalated",
]

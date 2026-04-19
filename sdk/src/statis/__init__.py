"""Statis Python SDK."""

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

# Re-export statis-kit context processing (offline, zero-auth)
from statis_kit import (
    CompressorConfig,
    GuardConfig,
    GuardHaltError,
    KitConfig,
    MeterConfig,
    ProcessedContext,
)
from statis_kit import process as process_context

__all__ = [
    "StatisClient",
    "Receipt",
    "StatisError",
    "ActionDeniedError",
    "ActionEscalatedError",
    "ActionDeferredError",
    "ActionTimeoutError",
    "StatisActionDenied",
    "StatisActionEscalated",
    # statis-kit re-exports
    "process_context",
    "KitConfig",
    "CompressorConfig",
    "MeterConfig",
    "GuardConfig",
    "GuardHaltError",
    "ProcessedContext",
]

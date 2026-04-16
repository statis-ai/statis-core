"""Load and query the model pricing table."""
from __future__ import annotations

import os
from typing import Any, Optional

import yaml  # type: ignore[import]

_DEFAULT_PRICING_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "pricing.yaml",
)

_cache: Optional[dict[str, Any]] = None


def load_pricing(path: Optional[str] = None) -> dict[str, Any]:
    global _cache
    resolved = path or _DEFAULT_PRICING_PATH
    if _cache is None or path is not None:
        with open(resolved) as f:
            _cache = yaml.safe_load(f)
    return _cache  # type: ignore[return-value]


def get_model_pricing(
    model: str,
    pricing: Optional[dict[str, Any]] = None,
) -> tuple[float, float]:
    """Return (input_per_1k, output_per_1k) for a model.

    Falls back to gpt-4o pricing if model not found.
    """
    table = pricing or load_pricing()
    models = table.get("models", {})

    if model in models:
        entry = models[model]
    else:
        # Bidirectional prefix match — handles both directions:
        #   passed "gpt-4o-2024-05-13" against key "gpt-4o"  (dated -> short)
        #   passed "claude-sonnet-4"   against key "claude-sonnet-4-20250514"  (short -> dated)
        matched = None
        for key in models:
            if model.startswith(key) or key.startswith(model):
                matched = key
                break
        entry = models.get(matched or "gpt-4o", {"input_per_1k": 0.0025, "output_per_1k": 0.01})

    return (entry["input_per_1k"], entry["output_per_1k"])

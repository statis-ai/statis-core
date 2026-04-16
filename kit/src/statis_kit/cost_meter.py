"""Token counting and cost estimation — tiktoken optional."""
from __future__ import annotations

from typing import Callable, Optional

from ._pricing import get_model_pricing, load_pricing
from ._types import CostEstimate, MeterConfig, Message, TurnCost


def _get_counter(model: str) -> Callable[[str], int]:
    """Return a token-counting function. Uses tiktoken when available."""
    try:
        import tiktoken  # type: ignore[import]

        # Map model names to tiktoken encodings
        try:
            enc = tiktoken.encoding_for_model(model)
        except KeyError:
            enc = tiktoken.get_encoding("cl100k_base")

        def _count(text: str) -> int:
            return len(enc.encode(text))

        return _count
    except ImportError:
        pass

    # Fallback: chars / 4 (rough approximation for English text)
    def _fallback(text: str) -> int:
        return max(1, len(text) // 4)

    return _fallback


class CostMeter:
    def __init__(self, config: Optional[MeterConfig] = None) -> None:
        cfg = config or MeterConfig()
        self._model = cfg.model
        self._pricing = load_pricing(cfg.pricing_path)
        self._on_turn = cfg.on_turn
        self._counter = _get_counter(cfg.model)

    def count_tokens(self, text: str) -> int:
        """Count tokens in a single string."""
        return self._counter(text)

    def count_messages(
        self, messages: list[Message],
    ) -> tuple[int, list[TurnCost]]:
        """Count tokens per turn and session total.

        Returns (total_tokens, per_turn_costs).
        """
        input_per_1k, _ = get_model_pricing(self._model, self._pricing)
        per_turn: list[TurnCost] = []
        total = 0

        for i, msg in enumerate(messages):
            tokens = self._counter(msg.content)
            cost = (tokens / 1000.0) * input_per_1k
            tc = TurnCost(
                turn_index=i,
                role=msg.role,
                tokens=tokens,
                cost_usd=cost,
            )
            per_turn.append(tc)
            total += tokens

            if self._on_turn is not None:
                self._on_turn(tc)

        return total, per_turn

    def estimate_cost(
        self,
        input_tokens: int,
        output_tokens: int = 0,
    ) -> CostEstimate:
        """Estimate cost based on model pricing table."""
        input_per_1k, output_per_1k = get_model_pricing(
            self._model, self._pricing,
        )
        input_cost = (input_tokens / 1000.0) * input_per_1k
        output_cost = (output_tokens / 1000.0) * output_per_1k
        return CostEstimate(
            input_cost_usd=round(input_cost, 8),
            output_cost_usd=round(output_cost, 8),
            total_cost_usd=round(input_cost + output_cost, 8),
            model=self._model,
        )

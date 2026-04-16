import json
import os

from statis_kit._types import MeterConfig, Message, TurnCost
from statis_kit.cost_meter import CostMeter

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def _load_messages(name: str) -> list[Message]:
    with open(os.path.join(FIXTURES, name)) as f:
        raw = json.load(f)
    return [Message(role=d["role"], content=d.get("content", "")) for d in raw]


class TestCostMeter:
    def test_count_messages_returns_totals(self):
        msgs = _load_messages("transcript_basic.json")
        meter = CostMeter()
        total, per_turn = meter.count_messages(msgs)
        assert total > 0
        assert len(per_turn) == len(msgs)
        assert sum(tc.tokens for tc in per_turn) == total

    def test_per_turn_has_correct_roles(self):
        msgs = _load_messages("transcript_basic.json")
        meter = CostMeter()
        _, per_turn = meter.count_messages(msgs)
        for i, tc in enumerate(per_turn):
            assert tc.turn_index == i
            assert tc.role == msgs[i].role

    def test_estimate_cost_gpt4o(self):
        meter = CostMeter(MeterConfig(model="gpt-4o"))
        est = meter.estimate_cost(1000, 500)
        # gpt-4o: input 0.0025/1k, output 0.01/1k
        assert abs(est.input_cost_usd - 0.0025) < 1e-6
        assert abs(est.output_cost_usd - 0.005) < 1e-6
        assert abs(est.total_cost_usd - 0.0075) < 1e-6
        assert est.model == "gpt-4o"

    def test_estimate_cost_claude_sonnet(self):
        meter = CostMeter(MeterConfig(model="claude-sonnet-4-20250514"))
        est = meter.estimate_cost(1000, 500)
        # claude-sonnet: input 0.003/1k, output 0.015/1k
        assert abs(est.input_cost_usd - 0.003) < 1e-6
        assert abs(est.output_cost_usd - 0.0075) < 1e-6

    def test_unknown_model_falls_back(self):
        meter = CostMeter(MeterConfig(model="unknown-model-xyz"))
        est = meter.estimate_cost(1000)
        # Should fall back to gpt-4o pricing
        assert abs(est.input_cost_usd - 0.0025) < 1e-6

    def test_on_turn_callback_fires(self):
        fired: list[TurnCost] = []
        meter = CostMeter(MeterConfig(on_turn=fired.append))
        msgs = [
            Message(role="user", content="Hello world"),
            Message(role="assistant", content="Hi there"),
        ]
        meter.count_messages(msgs)
        assert len(fired) == 2
        assert fired[0].role == "user"
        assert fired[1].role == "assistant"

    def test_count_tokens_positive(self):
        meter = CostMeter()
        assert meter.count_tokens("Hello world") > 0
        assert meter.count_tokens("") >= 0

    def test_long_transcript_cost(self):
        msgs = _load_messages("transcript_long.json")
        meter = CostMeter(MeterConfig(model="gpt-4o"))
        total, per_turn = meter.count_messages(msgs)
        est = meter.estimate_cost(total)
        assert est.total_cost_usd > 0
        assert len(per_turn) == len(msgs)

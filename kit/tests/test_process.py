import json
import os

import statis_kit

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def _load_raw(name: str) -> list[dict]:
    with open(os.path.join(FIXTURES, name)) as f:
        return json.load(f)


class TestProcess:
    def test_basic_transcript(self):
        msgs = _load_raw("transcript_basic.json")
        result = statis_kit.process(msgs)
        assert isinstance(result, statis_kit.ProcessedContext)
        assert len(result.messages) > 0
        assert result.report.original_tokens > 0
        assert result.report.processed_tokens > 0
        assert result.report.cost_estimate is not None

    def test_injection_transcript_detects(self):
        msgs = _load_raw("transcript_injection.json")
        result = statis_kit.process(msgs)
        assert len(result.report.guard_detections) > 0
        assert len(result.report.stripped_payloads) > 0

    def test_with_compressor(self):
        msgs = _load_raw("transcript_long.json")
        result = statis_kit.process(msgs, statis_kit.KitConfig(
            compressor=statis_kit.CompressorConfig(
                pin_top=1,
                recent_turns=4,
                prune_older_than_turns=5,
            ),
        ))
        assert len(result.messages) < len(msgs)
        assert result.report.token_delta > 0
        assert len(result.report.compressed_ranges) > 0

    def test_no_config_defaults(self):
        msgs = _load_raw("transcript_basic.json")
        result = statis_kit.process(msgs)
        # Should work with zero config — guard runs, no compression
        assert result.report.original_tokens == result.report.processed_tokens

    def test_returns_dicts(self):
        msgs = _load_raw("transcript_basic.json")
        result = statis_kit.process(msgs)
        # Output messages should be plain dicts
        assert isinstance(result.messages[0], dict)
        assert "role" in result.messages[0]
        assert "content" in result.messages[0]

    def test_halt_guard_raises(self):
        msgs = _load_raw("transcript_injection.json")
        try:
            statis_kit.process(msgs, statis_kit.KitConfig(
                guard=statis_kit.GuardConfig(on_detect="halt"),
            ))
            assert False, "Should have raised"
        except statis_kit.GuardHaltError as e:
            assert len(e.detections) > 0

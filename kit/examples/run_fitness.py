"""Run statis-kit against a real chatbot transcript and print a detailed report.

Usage:
    python3 examples/run_fitness.py
"""

import json
import sys
from pathlib import Path

from statis_kit import process, KitConfig, CompressorConfig, GuardConfig, MeterConfig


HERE = Path(__file__).parent
TRANSCRIPT = HERE / "fitness_session.json"


def fmt_dollars(x: float) -> str:
    return f"${x:.6f}"


def hrule(char: str = "-", width: int = 76) -> None:
    print(char * width)


def banner(title: str) -> None:
    hrule("=")
    print(title)
    hrule("=")


def run(model: str, compress: bool) -> None:
    messages = json.loads(TRANSCRIPT.read_text())

    config = KitConfig(
        guard=GuardConfig(on_detect="strip"),
        compressor=(
            CompressorConfig(
                pin_top=1,
                recent_turns=4,
                prune_older_than_turns=20,
                prune_if_superseded=True,
            )
            if compress
            else None
        ),
        meter=MeterConfig(model=model),
    )

    result = process(messages, config)
    r = result.report

    label = f"model={model}   compress={'on' if compress else 'off'}"
    banner(f"REPORT — {label}")

    # Tokens + cost
    pct = (r.token_delta / r.original_tokens * 100) if r.original_tokens else 0
    print(f"Messages:       {len(messages)} in → {len(result.messages)} out")
    print(f"Tokens:         {r.original_tokens} in → {r.processed_tokens} out")
    print(f"Delta:          -{r.token_delta} tokens ({pct:.1f}% reduction)")
    if r.cost_estimate:
        print(f"Est. cost:      {fmt_dollars(r.cost_estimate.total_cost_usd)} "
              f"(input-side, {r.cost_estimate.model})")
    print()

    # Guard
    print(f"Guard:          {len(r.guard_detections)} detection(s)")
    for d in r.guard_detections:
        print(f"  turn {d.turn_index:2d}  [{d.category}] {d.pattern_id}")
        snippet = d.matched_text[:70].replace("\n", " ")
        print(f"           match: {snippet!r}")
    print()

    # Compressed ranges
    if r.compressed_ranges:
        print(f"Compressed ranges: {len(r.compressed_ranges)}")
        for start, end in r.compressed_ranges:
            n = end - start + 1
            print(f"  turns {start:2d}–{end:2d}  ({n} messages collapsed)")
    else:
        print("Compressed ranges: 0")
    print()

    # Top 5 heaviest turns
    heaviest = sorted(r.per_turn_costs, key=lambda t: -t.tokens)[:5]
    print("Heaviest turns (processed transcript):")
    for t in heaviest:
        print(f"  turn {t.turn_index:2d}  {t.role:10s} {t.tokens:5d} tokens "
              f"({fmt_dollars(t.cost_usd)})")
    print()


def replay_cost(model: str) -> None:
    """What it would cost to 'replay' one more turn of this conversation."""
    messages = json.loads(TRANSCRIPT.read_text())

    cfg_raw = KitConfig(meter=MeterConfig(model=model))
    cfg_opt = KitConfig(
        guard=GuardConfig(on_detect="strip"),
        compressor=CompressorConfig(
            pin_top=1,
            recent_turns=4,
            prune_older_than_turns=20,
            prune_if_superseded=True,
        ),
        meter=MeterConfig(model=model),
    )

    raw = process(messages, cfg_raw)
    opt = process(messages, cfg_opt)

    savings = raw.report.cost_estimate.total_cost_usd - opt.report.cost_estimate.total_cost_usd
    pct = savings / raw.report.cost_estimate.total_cost_usd * 100 if raw.report.cost_estimate.total_cost_usd else 0
    print(f"  {model:20s} raw={fmt_dollars(raw.report.cost_estimate.total_cost_usd)}  "
          f"optimized={fmt_dollars(opt.report.cost_estimate.total_cost_usd)}  "
          f"saved={fmt_dollars(savings)} ({pct:.1f}%)")


def main() -> None:
    # Baseline: no compression, gpt-4o pricing
    run(model="gpt-4o", compress=False)

    # Optimized: compressor on
    run(model="gpt-4o", compress=True)

    banner("REPLAY COST — one more turn of this exact conversation")
    for m in ["gpt-4o", "gpt-4o-mini", "claude-sonnet-4", "claude-opus-4", "gemini-2.5-pro"]:
        replay_cost(m)


if __name__ == "__main__":
    main()

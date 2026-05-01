"""Statis design-partner outreach agent — daily entrypoint.

    python -m agents.outreach.main --max-prospects 5

Stages: research -> score -> draft -> send -> log. Every meaningful event
is gated through Statis. Receipts land on https://console.statis.dev.
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime, timezone

from statis import StatisClient

from .draft import draft_one
from .intake import intake_one
from .qualify import qualify_one
from .research import discover as discover_t1
from .research_yc import discover as discover_t2
from .score import score_one
from .seen import fetch_seen_handles, filter_unseen
from .send import send_and_log
from .sync import sync as sync_sheet


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--max-prospects", type=int, default=5)
    p.add_argument("--max-per-source", type=int, default=3)
    p.add_argument(
        "--tiers",
        default="2",
        help="Comma-separated tiers to run. 1=HN/GitHub individuals, 2=YC. Default: 2 (T1 needs domain resolution; gated off until next push).",
    )
    p.add_argument("--yc-max-per-batch", type=int, default=10)
    p.add_argument(
        "--no-sync",
        action="store_true",
        help="Skip the auto-sync at start. By default every run begins with a sync that writes sheet rows for any escalations the operator has approved since the last run.",
    )
    p.add_argument(
        "--sync-only",
        action="store_true",
        help="Skip the agent pipeline; only run the sync.",
    )
    p.add_argument(
        "--watch",
        action="store_true",
        help="After the pipeline finishes, keep polling the sync every --watch-interval seconds. Ctrl-C to stop. Useful: leave it running while you approve escalations in the console — the sheet updates within a minute of each click.",
    )
    p.add_argument("--watch-interval", type=int, default=60)
    p.add_argument(
        "--allow-duplicates",
        action="store_true",
        help="Don't dedupe against past prospects. By default, candidates whose "
             "LinkedIn handle was processed in any prior run are filtered out.",
    )
    p.add_argument(
        "--run-id",
        default=datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        help="Per-run nonce in action_ids; defaults to current UTC timestamp",
    )
    p.add_argument(
        "--base-url",
        default=os.environ.get("STATIS_BASE_URL", "https://statis-core.onrender.com"),
    )
    args = p.parse_args()

    if not os.environ.get("STATIS_API_KEY"):
        print("ERROR: STATIS_API_KEY not set", file=sys.stderr)
        return 2
    if not (os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")):
        print("ERROR: set OPENAI_API_KEY or ANTHROPIC_API_KEY", file=sys.stderr)
        return 2

    tiers = {int(t.strip()) for t in args.tiers.split(",") if t.strip()}
    print(f"== run_id: {args.run_id}  tiers={sorted(tiers)} ==")

    # Sync-on-approval is the default. Every run starts by writing sheet rows
    # for any escalations the operator has approved in the console since the
    # last invocation. Use --no-sync to skip (rare — e.g. when offline).
    should_sync = not args.no_sync or args.sync_only
    if should_sync:
        print()
        print(f"== Stage 0: sync-on-approval ==")
        result = sync_sheet(args.base_url, os.environ["STATIS_API_KEY"])
        print(f"  sync result: {result}")
        if args.sync_only:
            return 0

    print()
    print(f"== Stage 1: research ==")
    candidates: list = []
    if 1 in tiers:
        t1 = discover_t1(max_per_source=args.max_per_source)
        print(f"  T1 (HN+GitHub):  {len(t1)} candidates")
        candidates.extend(t1)
    if 2 in tiers:
        t2 = discover_t2(max_per_batch=args.yc_max_per_batch)
        print(f"  T2 (YC recent):  {len(t2)} candidates (verified domains only)")
        candidates.extend(t2)
    print(f"  total: {len(candidates)} candidates")
    if not candidates:
        return 0

    # Cross-run dedupe: drop any candidate whose LinkedIn handle was processed
    # in a prior run (regardless of decision). The set comes from the action
    # ledger — every connection_request ever proposed contributes its
    # recipient_profile.
    if not args.allow_duplicates:
        seen = fetch_seen_handles(args.base_url, os.environ["STATIS_API_KEY"])
        before = len(candidates)
        candidates = filter_unseen(candidates, seen)
        skipped = before - len(candidates)
        if skipped:
            print(f"  cross-run dedupe: skipped {skipped} already-processed handles ({len(seen)} seen total)")
        else:
            print(f"  cross-run dedupe: 0 duplicates ({len(seen)} seen total)")

    if not candidates:
        print("  all candidates already processed in prior runs — nothing new to do.")
        if args.watch:
            print("  (watch mode still active for sheet syncs)")
        else:
            return 0
    candidates = candidates[: args.max_prospects]

    client = StatisClient(base_url=args.base_url)
    receipts_seen: list[str] = []

    try:
        def _ckey(c) -> str:
            return f"{c.signal_url}|{c.target_linkedin_url or c.target_name or c.author_handle or ''}"

        print(f"\n== Stage 2: intake gate ({len(candidates)} candidates) ==")
        admitted: list = []
        intake_by_key: dict[str, tuple[str, str]] = {}
        for c in candidates:
            i = intake_one(client, c, run_id=args.run_id)
            label = c.target_name or c.author_handle or "?"
            print(
                f"  {label:<22} {c.source:<6} len={len(c.signal_text):>4} "
                f"intake={i.decision:<10} aid={i.statis_action_id}"
            )
            intake_by_key[_ckey(c)] = (i.decision, i.statis_action_id or "")
            if i.statis_action_id:
                receipts_seen.append(i.statis_action_id)
            if i.decision in ("APPROVED", "APPROVED_PENDING"):
                admitted.append(c)
        print(f"  admitted: {len(admitted)}/{len(candidates)}")

        print(f"\n== Stage 3: score ({len(admitted)} candidates) ==")
        scored: list = []
        for c in admitted:
            s = score_one(client, c, run_id=args.run_id)
            if s is None:
                continue
            scored.append(s)
            label = s.candidate.target_name or s.candidate.author_handle or "?"
            print(
                f"  {label:<22} score={s.icp_score:>3} "
                f"decision={s.decision:<10} aid={s.statis_action_id}"
            )
            if s.statis_action_id:
                receipts_seen.append(s.statis_action_id)

        print(f"\n== Stage 4: qualify gate ==")
        qualified: list = []
        qualify_by_key: dict[str, tuple[str, str]] = {}
        for s in scored:
            q = qualify_one(client, s, run_id=args.run_id)
            label = s.candidate.target_name or s.candidate.author_handle or "?"
            print(
                f"  {label:<22} score={s.icp_score:>3} "
                f"qualify={q.decision:<10} aid={q.statis_action_id}"
            )
            qualify_by_key[_ckey(s.candidate)] = (q.decision, q.statis_action_id or "")
            if q.statis_action_id:
                receipts_seen.append(q.statis_action_id)
            # In manual-review mode, ESCALATED at qualify means "operator decides"
            # — but the operator needs a DRAFT to make the call. So advance to
            # draft stage for ESCALATED too. Only DENIED stops the pipeline.
            if q.decision != "DENIED":
                qualified.append(s)
        print(f"  qualified (advanced to draft): {len(qualified)}/{len(scored)}")

        print(f"\n== Stage 5: draft ==")
        drafts: list = []
        for s in qualified:
            d = draft_one(client, s, run_id=args.run_id)
            if d is None:
                continue
            drafts.append(d)
            label = d.scored.candidate.target_name or d.scored.candidate.author_handle or "?"
            preview = d.connection_note.replace("\n", " ")[:80]
            print(
                f"  {label:<22} ({len(d.connection_note)} chars) "
                f"draft={d.decision:<10} aid={d.statis_action_id}"
            )
            print(f"    note> {preview}{'...' if len(d.connection_note) > 80 else ''}")
            if d.statis_action_id:
                receipts_seen.append(d.statis_action_id)

        print(f"\n== Stage 6+7: connection request + log ==")
        for d in drafts:
            key = _ckey(d.scored.candidate)
            i_dec, i_aid = intake_by_key.get(key, ("", ""))
            q_dec, q_aid = qualify_by_key.get(key, ("", ""))
            r = send_and_log(
                client, d, run_id=args.run_id,
                intake_action_id=i_aid, intake_decision=i_dec,
                qualify_action_id=q_aid, qualify_decision=q_dec,
            )
            backend = r.get("log_backend", "?")
            label = d.scored.candidate.target_name or d.scored.candidate.author_handle or "?"
            print(
                f"  {label:<22} connreq={r['connection_decision']:<10} log={r['log_decision']:<10} via={backend}"
            )
            if r["connection_action_id"]:
                receipts_seen.append(r["connection_action_id"])
            if r["log_action_id"]:
                receipts_seen.append(r["log_action_id"])
    finally:
        client.close()

    print(f"\n== Done ==")
    print(f"  receipts/escalations created: {len(receipts_seen)}")
    print(f"  console: https://console.statis.dev")
    print(f"  csv:     agents/outreach/outreach_log.csv")

    # Watch mode: keep polling sync until Ctrl-C. Approvals you click in
    # console show up in the sheet within --watch-interval seconds.
    if args.watch:
        print(f"\n== Watching: sync every {args.watch_interval}s — Ctrl-C to stop ==")
        try:
            while True:
                time.sleep(args.watch_interval)
                print(f"\n  [{datetime.now(timezone.utc).strftime('%H:%M:%S')}] sync tick")
                try:
                    r = sync_sheet(args.base_url, os.environ["STATIS_API_KEY"])
                    if r["written"]:
                        print(f"    wrote {r['written']} new sheet rows")
                except Exception as e:
                    print(f"    sync error: {e}")
        except KeyboardInterrupt:
            print("\n  watch stopped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

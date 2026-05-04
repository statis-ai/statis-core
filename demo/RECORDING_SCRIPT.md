# 90-second demo recording script

## Before you record — pre-warm (off-camera)

Run the script twice and approve both in the browser. This seeds 2 approvals
so the third (on-camera) run triggers graduation.

```bash
export STATIS_API_KEY=sk-...
cd demo/
python3 agent.py   # → approve in browser (approval 1)
python3 agent.py   # → approve in browser (approval 2)
```

Don't close the browser tab — you'll switch back to it during recording.

---

## Setup for recording

- Terminal: wide, dark theme, 18–20px JetBrains Mono, `clear` the screen
- Browser: `console.statis.dev` in a ready tab, zoomed to 110%
- Recording: QuickTime screen recording or Loom

---

## [0:00–0:12] Show the decorator

```bash
cat agent.py
```

Scroll slowly to show just the `@gate` line + function signature. Don't read
it aloud — let the code speak. Then `clear`.

---

## [0:12–0:30] Run 3 — gate escalates, prints URL

```bash
python3 agent.py
```

Expected output:
```
agent: issuing refund for ch_3PxDemo — $49.99

[statis] approval URL: https://console.statis.dev/a/act_01...?sig=...

⏸  pending human approval

   approval URL → https://console.statis.dev/a/act_01...?sig=...

   open the URL, review the args, click Approve
   then re-run: python agent.py
```

Pause 2 seconds on the URL.

---

## [0:30–0:55] Switch to browser — approve — graduation fires

Open the approval URL.

The page shows:
- Action:  stripe_refund
- Args:    charge_id=ch_3PxDemo_statis0, cents=4999

Below the args, the **AuditPanel** shows:
> "2 prior identical approvals in the last 48h — expand to inspect"

Click **Approve**.

Page morphs to the decided state. The graduation banner appears:
> "Rule auto-drafted: stripe_refund_auto"

Hover over the rule link to show it's a real policy now. Don't click — just
let it breathe for 2 seconds.

---

## [0:55–1:10] Back to terminal — Run 4, instant approval

```bash
python3 agent.py
```

Expected output (no URL, no pause — auto-approved by the graduated rule):
```
agent: issuing refund for ch_3PxDemo — $49.99

✓  refund executed
   id:     re_tatis0
   amount: $49.99
   status: succeeded

   receipt written → run `statis receipts list` to verify
```

Hold on this for 3 seconds.

---

## [1:10–1:30] Show the policy that was written

Switch to browser → `console.statis.dev/policies`

The policy list shows:
```
stripe_refund_auto   APPROVED   graduated   active
```

Optional: click into it to show the auto-generated YAML rule.

Cut.

---

## Post-processing

- Trim silence at start/end
- Add text overlays:
  - :12  "pip install statis-ai"
  - :18  "@statis.gate — one decorator"
  - :55  "no URL. no pause. auto-approved."
  - 1:15  "policy auto-written from your approvals"
- Export: 1080p MP4 for Twitter embed, first 12s as a GIF for the lead tweet
- Upload MP4 to statis.dev/demo.mp4, link from Show HN post

---

## The arc in one sentence

Agent calls a function → gate asks permission → human approves 3 times →
Statis writes the policy → agent runs itself from then on.

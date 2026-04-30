"""Draft stage — generate connection note + post-accept follow-up DM, gated through Statis.

Two messages per prospect:
  - connection_note  ≤280 chars, attached to the LinkedIn invite. NO Calendly.
  - followup_dm      400-500 chars, sent after the prospect accepts the invite.
                     Includes Calendly link.
"""
from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass
from typing import Any

from statis import StatisClient, ActionDeniedError, ActionEscalatedError, ActionTimeoutError
from statis_kit import Guard, GuardConfig, messages_from_dicts

from .llm import call_llm_json
from .score import AGENT_ID, ScoredProspect


@dataclass
class DraftedMessage:
    scored: ScoredProspect
    connection_note: str   # ≤280 chars — what goes into the LinkedIn invite
    followup_dm: str        # 400-500 chars — sent after they accept
    statis_action_id: str | None  # the outreach_draft_message receipt
    decision: str

    @property
    def message_body(self) -> str:
        # Backward compat: pre-existing send.py reads .message_body for the
        # primary outbound. The connection_note is the primary now.
        return self.connection_note

    def to_dict(self) -> dict[str, Any]:
        return {
            "scored": self.scored.to_dict(),
            "connection_note": self.connection_note,
            "followup_dm": self.followup_dm,
            "statis_action_id": self.statis_action_id,
            "decision": self.decision,
        }


_DRAFTING_SYSTEM = """You are writing two LinkedIn messages from Aniket, founder of Statis.

Statis is the trust layer for production AI agents — three pillars:
- Context In: prompt-injection defense, PII redaction, cost metering
- Action Out: policy-gated tool execution with human-in-loop escalation
- Receipt Through: cryptographically tamper-evident audit trail
Beta is free for 12 months for design partners. Landing: https://www.statis.dev
Calendly (only mention in followup_dm): https://calendly.com/aniket-statis/30min

The flow is two-step: first a LinkedIn connection request with a short note,
then (after they accept) a follow-up DM with the actual ask.

Output a JSON object with exactly these two fields:

{
  "connection_note": "<the connection-request note, MAX 280 chars>",
  "followup_dm": "<the post-accept DM, 350-500 chars, includes Calendly>"
}

CONNECTION NOTE rules (the invite — they see this BEFORE accepting):
- 1-2 sentences. MAX 280 chars total. Hard limit.
- Open by referencing their specific public artifact (YC batch + product /
  HN post / GitHub issue) — proves you actually read it.
- One concrete sentence on why Statis is relevant to their work. NO pitch.
- NO calendly link. NO ask. The accept IS the ask.
- Plain text. No markdown. No emojis. No "Hope this finds you well." No
  "I'm reaching out". No "synergy", "leverage", "AI-powered".

FOLLOWUP DM rules (sent after they accept):
- 350-500 chars. Plain text.
- Open: a quick reminder of the connection-note hook (1 sentence, different
  phrasing — not a copy).
- Body: 1-2 sentences on how Statis would help with their specific work,
  one concrete primitive (gate / receipt / kit guard).
- Soft CTA: "open to a 20-min chat?" with the Calendly link inline.
- Same banned words as the connection note.

Sound like a founder, not a SDR. Return ONLY the JSON object — no preamble,
no markdown fences, no commentary."""


_GUARD = Guard(GuardConfig(on_detect="strip"))


def _kit_clean_input(scored: ScoredProspect) -> tuple[str, dict[str, Any]]:
    """Strip prompt-injection patterns from the scoring summary before drafting."""
    text = (
        f"Author: {scored.candidate.author_handle}\n"
        f"Company: {scored.candidate.company_name}\n"
        f"Batch / Stage: {scored.candidate.company_batch}\n"
        f"Inferred role: {scored.inferred_role}\n"
        f"Signal: {scored.candidate.signal_text}\n"
        f"Score: {scored.icp_score}. Reasoning: {scored.reasoning}\n"
    )
    msgs = messages_from_dicts([{"role": "user", "content": text}])
    result = _GUARD.scan(msgs)
    cleaned = result.messages[0].content if result.messages else text
    report = {"guard_detections": len(result.detections)}
    return cleaned, report


def draft_one(client: StatisClient, scored: ScoredProspect, run_id: str = "v0") -> DraftedMessage | None:
    if scored.icp_score < 60:
        return None  # below floor — skip drafting entirely

    cleaned, kit_report = _kit_clean_input(scored)
    try:
        out = call_llm_json(
            system=_DRAFTING_SYSTEM,
            user=f"Draft the connection note + follow-up DM for this prospect:\n\n{cleaned}",
            max_tokens=600,
        )
    except Exception as e:
        print(f"  ! draft llm error for {scored.candidate.author_handle}: {e}")
        return None

    connection_note = (out.get("connection_note") or "").strip()
    followup_dm = (out.get("followup_dm") or "").strip()
    if not connection_note or not followup_dm:
        print(f"  ! draft llm returned incomplete output for {scored.candidate.author_handle}")
        return None
    # Hard-truncate the connection note to LinkedIn's 280-char invite limit.
    if len(connection_note) > 280:
        connection_note = connection_note[:277] + "..."

    aid_seed = f"draft:{run_id}:{scored.candidate.source}:{scored.candidate.signal_url}"
    action_id = "draft-" + hashlib.sha256(aid_seed.encode()).hexdigest()[:24]
    target_id = f"{scored.candidate.source}:{scored.candidate.author_handle or 'unknown'}"

    decision = "UNKNOWN"
    statis_action_id: str | None = None
    try:
        receipt = client.execute(
            action_id=action_id,
            action_type="outreach_draft_message",
            target={"entity_type": "prospect", "entity_id": target_id},
            target_system="outreach_draft_message",
            agent_id=AGENT_ID,
            parameters={
                "connection_note": connection_note,
                "followup_dm": followup_dm,
                "message_body": connection_note,  # legacy field for required_fields rule
                "channel": "linkedin",
                "signal_url": scored.candidate.signal_url,
            },
            context={
                "icp_score": scored.icp_score,
                "signal_seen_at": scored.candidate.signal_seen_at,
                "kit_report": kit_report,
                "connection_note_len": len(connection_note),
                "followup_dm_len": len(followup_dm),
            },
            timeout=2.0,
        )
        decision = "APPROVED"
        statis_action_id = receipt.action_id
    except ActionDeniedError as e:
        decision = "DENIED"
        statis_action_id = e.receipt.action_id if e.receipt else None
    except ActionEscalatedError as e:
        decision = "ESCALATED"
        statis_action_id = e.action_id
    except ActionTimeoutError as e:
        decision = "APPROVED_PENDING"
        statis_action_id = e.action_id

    return DraftedMessage(
        scored=scored,
        connection_note=connection_note,
        followup_dm=followup_dm,
        statis_action_id=statis_action_id,
        decision=decision,
    )

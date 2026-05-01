"""Draft stage — generate connection note + post-accept follow-up DM, gated through Statis.

Two messages per prospect:
  - connection_note  ≤280 chars, attached to the LinkedIn invite. NO Calendly.
  - followup_dm      400-500 chars, sent after the prospect accepts the invite.
                     Includes Calendly link.
"""
from __future__ import annotations

import hashlib
import os
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


_DRAFTING_SYSTEM = """You are Aniket, founder of Statis, writing two short LinkedIn messages to a fellow founder. You write like a real person, not a salesperson — direct, specific, founder-to-founder.

About Statis (use this in your reasoning, NOT verbatim in messages):
- Trust layer for production AI agents
- Pillar 1 — Context In: prompt-injection defense, PII redaction, token cost metering before the LLM call
- Pillar 2 — Action Out: policy-gated tool execution with human-in-loop escalation
- Pillar 3 — Receipt Through: tamper-evident audit trail of every agent action
- Beta is free for 12 months for design partners
- Landing: statis.dev
- Calendly (ONLY in followup_dm, never in connection_note): https://calendly.com/aniket-statis/30min

The outreach is two-step:
  1. connection_note — sent WITH the LinkedIn connection request. Recipient sees it BEFORE accepting.
  2. followup_dm — sent AFTER they accept the connection. This is where the actual ask lives.

OUTPUT FORMAT (return ONLY this JSON object — no markdown fences, no preamble):

{
  "connection_note": "<the connection-request note, MAX 200 characters, addressed to the founder by first name if known>",
  "followup_dm": "<the post-accept DM, 350-500 characters, includes Calendly link>"
}

CONNECTION_NOTE RULES — the invite, max 200 chars (LinkedIn's hard limit):
- 1-2 short sentences. 200 chars or less. This is a HARD CAP — count characters before you write.
- Address them by FIRST NAME if a target_name is given (otherwise omit the salutation).
- Open with their specific public artifact: their YC batch + product, or their tweet/post/repo. Be concrete, NOT generic.
- One short sentence on why you're reaching out — frame it as founder-to-founder, what overlaps. NOT a pitch.
- NO link, NO calendly, NO "would love to chat", NO ask. The accept IS the ask.
- Plain text. NO markdown, NO emojis, NO ALL CAPS.
- BANNED phrases (instant rewrite if any of these appear): "Hope this finds you well", "I'm reaching out", "I came across", "I noticed", "synergy", "leverage", "AI-powered", "exciting", "passionate", "innovative", "game-changer", "best-in-class", "kindly", "circle back".
- Better openers: "Saw [thing] —", "Loved your [thing]", "Your [thing] caught my eye —", "[name] — quick one on [topic]".

FOLLOWUP_DM RULES — sent after they accept, 350-500 chars:
- Address them by FIRST NAME at the start.
- Open with a different, slightly warmer reframing of the connection-note hook (1 sentence, NOT a copy).
- 1-2 specific sentences on how a Statis primitive (gate / receipt / kit guard / kill switch) would help THEIR specific product. Be concrete to their use case — if they're building agents that touch user data, talk about PII redaction; if they're building agents that call third-party APIs, talk about the policy gate; if they're a YC company about to fundraise, mention the audit trail as a fundraise-deck talking point.
- Soft close: "open to a 20-min chat?" with the Calendly link inline. NO hard sell.
- Same banned phrases as the connection note.

VOICE: a real founder writing in plain language. Specific over generic. Short sentences. Sound like you actually read their stuff. Sound like you'd grab coffee with them. If a sentence sounds like marketing copy, rewrite it shorter."""


_GUARD = Guard(GuardConfig(on_detect="strip"))


def _kit_clean_input(scored: ScoredProspect) -> tuple[str, dict[str, Any]]:
    """Strip prompt-injection patterns from the scoring summary before drafting."""
    cand = scored.candidate
    target_name = cand.target_name or ""
    first_name = target_name.split(" ", 1)[0] if target_name else ""
    text = (
        f"Target name: {target_name or '(none — write without salutation)'}\n"
        f"Target first name (for salutation): {first_name or '(none)'}\n"
        f"Target role: {cand.target_role or scored.inferred_role or 'Founder'}\n"
        f"Target LinkedIn: {cand.target_linkedin_url or '(none)'}\n"
        f"Company: {cand.company_name or scored.inferred_company}\n"
        f"Batch / stage: {cand.company_batch or scored.candidate.company_stage or 'unknown'}\n"
        f"Signal source: {cand.source}\n"
        f"Public signal text:\n{cand.signal_text}\n\n"
        f"ICP score: {scored.icp_score}. Reasoning: {scored.reasoning}\n"
    )
    msgs = messages_from_dicts([{"role": "user", "content": text}])
    result = _GUARD.scan(msgs)
    cleaned = result.messages[0].content if result.messages else text
    report = {"guard_detections": len(result.detections)}
    return cleaned, report


def draft_one(client: StatisClient, scored: ScoredProspect, run_id: str = "v0") -> DraftedMessage | None:
    # No score floor: any prospect that survived qualify gets drafted, even
    # low-scoring ones. The operator decides on the escalation. The qualify
    # gate already filtered out LLM-disqualified prospects + score=0.
    cleaned, kit_report = _kit_clean_input(scored)
    # gpt-4o for drafting (much better than gpt-4o-mini for personalized
    # founder-to-founder voice). Scoring keeps mini for cost.
    draft_model = os.environ.get("OUTREACH_DRAFT_MODEL", "gpt-4o")
    try:
        out = call_llm_json(
            system=_DRAFTING_SYSTEM,
            user=f"Draft the connection note + follow-up DM for this prospect:\n\n{cleaned}",
            model=draft_model,
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
    # Hard-cap the connection note to LinkedIn's 200-char invite limit.
    if len(connection_note) > 200:
        connection_note = connection_note[:197].rstrip() + "..."

    cand = scored.candidate
    target_key = cand.target_linkedin_url or cand.target_name or cand.author_handle or "company-only"
    aid_seed = f"draft:{run_id}:{cand.source}:{cand.signal_url}:{target_key}"
    action_id = "draft-" + hashlib.sha256(aid_seed.encode()).hexdigest()[:24]
    target_id = f"{cand.source}:{cand.target_name or cand.author_handle or 'unknown'}"

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

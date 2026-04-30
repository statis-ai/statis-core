"""Draft stage — generate a personalized LinkedIn DM, gated through Statis."""
from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass
from typing import Any

from statis import StatisClient, ActionDeniedError, ActionEscalatedError
from statis_kit import process as kit_process
from statis_kit import KitConfig, GuardConfig, CompressorConfig, MeterConfig

from .llm import call_claude
from .score import AGENT_ID, ScoredProspect


@dataclass
class DraftedMessage:
    scored: ScoredProspect
    message_body: str
    statis_action_id: str | None
    decision: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "scored": self.scored.to_dict(),
            "message_body": self.message_body,
            "statis_action_id": self.statis_action_id,
            "decision": self.decision,
        }


_DRAFTING_SYSTEM = """You are writing one short LinkedIn DM from Aniket, founder of Statis.

Statis is the trust layer for production AI agents — three pillars: Context In (prompt-injection defense, PII redaction, cost metering), Action Out (policy-gated tool execution with human-in-loop escalation), Receipt Through (cryptographically tamper-evident audit trail). Beta is free for 12 months for design partners. Landing: https://www.statis.dev. Calendly: https://calendly.com/aniket-statis/30min

Hard rules:
- Open by referencing the prospect's specific public signal in 1 sentence — make it clear you actually read it.
- One concrete bridge: how Statis would have caught / would help with that specific pain.
- Soft CTA: "open to a 20-min chat?" — include the Calendly link inline.
- Total length: 350-500 chars. Plain text. No markdown. No emojis. No "Hope this finds you well." No "I'm reaching out". No "synergy", "leverage", "AI-powered".
- Sound like a founder, not a SDR.

Return ONLY the message body — no subject, no preamble, no commentary."""


def _kit_clean_input(scored: ScoredProspect) -> tuple[str, dict[str, Any]]:
    """Re-run Kit on the scoring summary before showing it to the drafter."""
    text = (
        f"Author: {scored.candidate.author_handle}\n"
        f"Inferred role: {scored.inferred_role}\n"
        f"Inferred company: {scored.inferred_company}\n"
        f"Signal: {scored.candidate.signal_text}\n"
        f"Score: {scored.icp_score}. Reasoning: {scored.reasoning}\n"
    )
    cfg = KitConfig(
        guard=GuardConfig(on_detect="strip"),
        compressor=CompressorConfig(pin_top=0, recent_turns=1),
        meter=MeterConfig(model="claude-sonnet-4-5"),
    )
    result = kit_process([{"role": "user", "content": text}], cfg)
    cleaned = result.messages[0]["content"] if result.messages else text
    report = {
        "token_delta": result.report.token_delta,
        "cost_usd": result.report.cost_estimate.usd if result.report.cost_estimate else 0.0,
        "guard_detections": len(result.report.guard_detections),
    }
    return cleaned, report


def draft_one(client: StatisClient, scored: ScoredProspect) -> DraftedMessage | None:
    if scored.icp_score < 60:
        return None  # below floor — skip drafting entirely

    cleaned, kit_report = _kit_clean_input(scored)
    try:
        body = call_claude(
            system=_DRAFTING_SYSTEM,
            user=f"Draft the LinkedIn DM for this prospect:\n\n{cleaned}",
            max_tokens=400,
        ).strip()
    except Exception as e:
        print(f"  ! draft llm error for {scored.candidate.author_handle}: {e}")
        return None

    aid_seed = f"draft:{scored.candidate.source}:{scored.candidate.signal_url}"
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
                "message_body": body,
                "channel": "linkedin",
                "signal_url": scored.candidate.signal_url,
            },
            context={
                "icp_score": scored.icp_score,
                "signal_seen_at": scored.candidate.signal_seen_at,
                "kit_report": kit_report,
            },
            timeout=10.0,
        )
        decision = "APPROVED"
        statis_action_id = receipt.action_id
    except ActionDeniedError as e:
        decision = "DENIED"
        statis_action_id = e.receipt.action_id if e.receipt else None
    except ActionEscalatedError as e:
        decision = "ESCALATED"
        statis_action_id = e.action_id

    return DraftedMessage(
        scored=scored,
        message_body=body,
        statis_action_id=statis_action_id,
        decision=decision,
    )

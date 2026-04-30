"""Thin LLM wrapper — provider-agnostic, single function, no SDK dep.

Auto-selects between OpenAI and Anthropic based on which env key is set.
OpenAI takes precedence when both are set so you can swap providers without
code changes.
"""
from __future__ import annotations

import json
import os
from typing import Any

import httpx


_OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions"
_ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages"


def _provider() -> str:
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    raise RuntimeError("Set OPENAI_API_KEY or ANTHROPIC_API_KEY")


def _default_model() -> str:
    explicit = os.environ.get("OUTREACH_LLM_MODEL")
    if explicit:
        return explicit
    return {"openai": "gpt-4o-mini", "anthropic": "claude-sonnet-4-5"}[_provider()]


def call_llm(
    system: str,
    user: str,
    model: str | None = None,
    max_tokens: int = 1024,
    timeout: float = 60.0,
) -> str:
    provider = _provider()
    model = model or _default_model()

    if provider == "openai":
        body = {
            "model": model,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        resp = httpx.post(
            _OPENAI_ENDPOINT,
            json=body,
            headers={
                "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
                "Content-Type": "application/json",
            },
            timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    # anthropic
    body = {
        "model": model,
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }
    resp = httpx.post(
        _ANTHROPIC_ENDPOINT,
        json=body,
        headers={
            "x-api-key": os.environ["ANTHROPIC_API_KEY"],
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        timeout=timeout,
    )
    resp.raise_for_status()
    data = resp.json()
    return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")


def call_llm_json(
    system: str,
    user: str,
    model: str | None = None,
    max_tokens: int = 1024,
) -> dict[str, Any]:
    raw = call_llm(system, user, model=model, max_tokens=max_tokens).strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        raw = raw[start : end + 1]
    return json.loads(raw)


# Backwards compat aliases — score.py + draft.py originally imported these names.
call_claude = call_llm
call_claude_json = call_llm_json

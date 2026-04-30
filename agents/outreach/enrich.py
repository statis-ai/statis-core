"""Enrichment helpers — domain extraction + verification.

A prospect can't enter the funnel without a verified company domain. This
module provides the deterministic pre-LLM check that the intake policy
enforces: extract a root domain from a candidate URL, reject aggregator/
social hosts, and confirm the domain is live.
"""
from __future__ import annotations

import re
import socket
from typing import NamedTuple
from urllib.parse import urlparse

import httpx


# ── Competitor / overlap filter ────────────────────────────────────────────
# Companies whose product overlaps with Statis pillars (Context In = Kit,
# Action Out = policy gate, Receipt Through = ledger). We don't pitch these.
# Keep narrow — false positives waste good prospects. False negatives are
# caught downstream by the LLM scorer's `disqualified` flag.

COMPETITOR_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, re.IGNORECASE) for p in [
        # Pillar 1 — context hygiene / cost metering
        r"\b(llm|ai)[- ]native\s+(context\s+)?(compression|optimization|caching)\b",
        r"\b(prompt|context)\s+(injection\s+)?(defense|guard|firewall)\b",
        r"\btoken\s+(cost\s+)?(meter|metering|tracking|budget)\s+for\s+(llm|ai)",

        # Pillar 2 — policy gate / agent governance / agent gateway
        r"\b(ai|agent)\s+(governance|policy|gateway|gating)\s+(platform|layer|tool)?",
        r"\bpolicy[- ]gated\s+(tool|action|agent)\s+execution\b",
        r"\bagent\s+(permissions|kill[- ]switch|access\s+control)\b",
        r"\bhuman[- ]in[- ]the[- ]loop\s+(agent\s+)?(approval|escalation)\s+platform\b",

        # Pillar 3 — receipts / audit / observability for agents
        r"\b(production\s+)?monitoring\s+for\s+ai\s+agents?\b",
        r"\bagent\s+(observability|monitoring|audit|telemetry|tracing)\b",
        r"\bsentry\s+for\s+(ai|agents)\b",
        r"\b(tamper[- ]evident|cryptographic)\s+(receipt|audit\s+log)\s+for\s+(ai|agents)\b",

        # Catch-alls
        r"\bagent\s+trust\s+(layer|platform)\b",
        r"\btrust\s+layer\s+for\s+(ai|production)\s+agents?\b",
        r"\bcompliance\s+(layer\s+)?for\s+ai\s+agents?\b",
    ]
)


def is_competitor(text: str | None) -> tuple[bool, str]:
    """Return (matched, matched_pattern) for the competitor filter.

    Used at intake (cheap, deterministic) and surfaced into the score
    prompt so the LLM can confirm. False positives are rare given the
    narrow patterns; the LLM scorer overrides via `disqualified=true`.
    """
    if not text:
        return False, ""
    for pat in COMPETITOR_PATTERNS:
        m = pat.search(text)
        if m:
            return True, m.group(0).lower().strip()
    return False, ""


# Domains that aggregate user content — having a profile URL here does NOT
# count as having a company domain. A real startup has its own root.
AGGREGATOR_DOMAINS: frozenset[str] = frozenset({
    "github.com",
    "gist.github.com",
    "linkedin.com",
    "twitter.com",
    "x.com",
    "news.ycombinator.com",
    "ycombinator.com",  # YC's own pages aren't a company domain
    "youtube.com",
    "youtu.be",
    "medium.com",
    "substack.com",
    "hashnode.com",
    "hashnode.dev",
    "dev.to",
    "vercel.app",
    "netlify.app",
    "github.io",
    "gitlab.io",
    "bitbucket.io",
    "notion.site",
    "notion.so",
    "gitbook.io",
    "wordpress.com",
    "blogspot.com",
    "wixsite.com",
    "webflow.io",
    "carrd.co",
    "bio.link",
    "linktr.ee",
    "beacons.ai",
    "googlesites.com",
    "sites.google.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "reddit.com",
    "stackoverflow.com",
    "producthunt.com",
})


class DomainCheck(NamedTuple):
    domain: str | None  # root domain, e.g. "acme.ai"
    is_aggregator: bool
    live: bool  # True iff HTTP probe returned 2xx/3xx within timeout

    @property
    def verified(self) -> bool:
        return bool(self.domain) and not self.is_aggregator and self.live


def extract_root(url: str | None) -> str | None:
    """Return the lowercased registrable root for a URL, or None.

    Strips scheme, path, query. Drops `www.` prefix. Doesn't try to handle
    multi-part TLDs (".co.uk") — fine for v0; misses are rare and the
    aggregator/liveness checks catch most of what would matter.
    """
    if not url:
        return None
    candidate = url.strip()
    if "://" not in candidate:
        candidate = "https://" + candidate
    try:
        host = (urlparse(candidate).hostname or "").lower()
    except ValueError:
        return None
    if not host:
        return None
    if host.startswith("www."):
        host = host[4:]
    return host or None


def is_aggregator(domain: str | None) -> bool:
    if not domain:
        return True
    if domain in AGGREGATOR_DOMAINS:
        return True
    # Subdomain match: acme.vercel.app counts as aggregator
    for blocked in AGGREGATOR_DOMAINS:
        if domain.endswith("." + blocked):
            return True
    return False


def _dns_resolves(domain: str) -> bool:
    try:
        socket.getaddrinfo(domain, None)
        return True
    except (socket.gaierror, socket.herror):
        return False


def verify_domain(url: str | None, timeout: float = 5.0) -> DomainCheck:
    """Two-step gate: aggregator filter + liveness probe.

    Doesn't follow infinite redirects; one redirect hop is fine. Returns
    DomainCheck with .verified for the final gate decision.
    """
    domain = extract_root(url)
    if not domain:
        return DomainCheck(domain=None, is_aggregator=False, live=False)

    if is_aggregator(domain):
        return DomainCheck(domain=domain, is_aggregator=True, live=False)

    if not _dns_resolves(domain):
        return DomainCheck(domain=domain, is_aggregator=False, live=False)

    # Probe https first (most company sites), fall back to http
    probe_url = f"https://{domain}"
    try:
        resp = httpx.get(probe_url, timeout=timeout, follow_redirects=True)
        live = 200 <= resp.status_code < 400
    except (httpx.RequestError, httpx.TimeoutException):
        try:
            resp = httpx.get(f"http://{domain}", timeout=timeout, follow_redirects=True)
            live = 200 <= resp.status_code < 400
        except (httpx.RequestError, httpx.TimeoutException):
            live = False

    return DomainCheck(domain=domain, is_aggregator=False, live=live)

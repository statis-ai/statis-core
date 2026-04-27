"use client";

/**
 * `/a/{action_id}/decided` — the post-decision destination for users who
 * arrive via a stale link or a forwarded URL after the action is closed.
 *
 * The main `/a/{action_id}` page handles the same shapes inline via the
 * D24 morph + D32 race banner. This route is the deep-linkable form of
 * the same shapes — useful for Slack notifications and audit trails.
 *
 * The page reads `?shape=...&...` query params and renders the matching
 * D20 variant. Lane 1 redirects to this URL when the decision flow runs
 * via a non-AJAX path (e.g. a posted form from a no-JS client).
 */
import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PublicPageChrome } from "@/components/PublicPageChrome";
import { StateBanner } from "@/components/StateBanner";
import { ApprovalShape } from "@/lib/approval-types";


export default function DecidedPage(): React.ReactElement {
  const params = useParams<{ action_id: string }>();
  const search = useSearchParams();
  const actionId = params?.action_id || "";
  const shape = search.get("shape") || ApprovalShape.ALREADY_DECIDED_RACE;
  const detail = search.get("detail") || "";
  const decision = (search.get("decision") || "APPROVED") as "APPROVED" | "DENIED";
  const decidedBy = search.get("decided_by") || null;
  const receiptUrl = search.get("receipt_url") || "";
  const expiredAt = search.get("expired_at") || "";
  const rotatedAt = search.get("rotated_at") || "";

  switch (shape) {
    case ApprovalShape.EXPIRED_ERROR:
      return (
        <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
          <StateBanner
            variant="warn"
            title="LINK EXPIRED"
            caption={expiredAt ? `expired ${formatTime(expiredAt)}` : undefined}
          />
          <p data-testid="expired-detail">
            {detail || "Ask the agent to re-issue the request."}
          </p>
          <p>
            Action <code>{actionId}</code>
          </p>
        </PublicPageChrome>
      );
    case ApprovalShape.INVALID_SIG_ERROR:
      // D20 — NO action_id leak.
      return (
        <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
          <StateBanner variant="fail" title="INVALID LINK" caption="signature" />
          <p data-testid="invalid-detail">
            {detail || "Token is invalid or tampered with."}
          </p>
        </PublicPageChrome>
      );
    case ApprovalShape.ROTATED_ERROR:
      return (
        <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
          <StateBanner
            variant="fail"
            title="LINK INVALIDATED"
            caption={rotatedAt ? `tenant key rotated ${formatTime(rotatedAt)}` : undefined}
          />
          <p data-testid="rotated-detail">
            {detail || "The tenant signing key was rotated; this link is no longer valid."}
          </p>
        </PublicPageChrome>
      );
    case ApprovalShape.ALREADY_DECIDED_RACE:
    default:
      return (
        <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
          <StateBanner
            variant="ok"
            title="ALREADY DECIDED"
            caption={`${decision.toLowerCase()} by ${decidedBy ?? "another reviewer"}`}
          />
          <p data-testid="race-detail">
            This action was already decided.{" "}
            {receiptUrl ? <a href={receiptUrl}>View receipt →</a> : null}
          </p>
        </PublicPageChrome>
      );
  }
}


function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

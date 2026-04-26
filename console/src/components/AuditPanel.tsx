"use client";

/**
 * AuditPanel — D18
 *
 * "3 prior approvals" expandable audit panel. Sits between the headline
 * and the YAML preview in the graduation overlay flow per D18's reorder:
 *
 *   eyebrow → headline → sub → AuditPanel → impact stats → YAML preview → actions
 *
 * Fetches GET /actions/{action_id}/similar?window=48h&limit=3 (Lane 1
 * route) and renders a closed `<details>` by default. The user can
 * expand to see action_id + decided_at + decided_by per prior approval.
 *
 * On fetch error: panel renders nothing rather than throwing — graduation
 * overlay should still be useful even if the audit fetch is degraded.
 */
import * as React from "react";
import type { SimilarApprovalsResponse, SimilarApproval } from "@/lib/approval-types";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

export interface AuditPanelProps {
  actionId: string;
  windowSeconds?: number;
  limit?: number;
}

export function AuditPanel({
  actionId,
  windowSeconds = 48 * 3600,
  limit = 3,
}: AuditPanelProps): React.ReactElement | null {
  const [data, setData] = React.useState<SimilarApprovalsResponse | null>(null);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch(
      `${API_BASE}/actions/${encodeURIComponent(actionId)}/similar` +
        `?window=${windowSeconds}&limit=${limit}`,
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((payload: SimilarApprovalsResponse) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });
    return () => {
      cancelled = true;
    };
  }, [actionId, windowSeconds, limit]);

  if (errored) return null;
  if (data === null) return null;
  if (data.count === 0) return null;

  return (
    <details className="audit-panel" data-testid="audit-panel">
      <summary className="audit-panel__summary">
        {data.count} prior identical approval{data.count === 1 ? "" : "s"} in the
        last {Math.round(windowSeconds / 3600)}h — expand to inspect
      </summary>
      {data.approvals.map((a: SimilarApproval) => (
        <div key={a.action_id} className="audit-panel__row">
          <span>{a.action_id}</span>
          <span>{formatRelative(a.decided_at)}</span>
          <span>{a.decided_by ?? "system"}</span>
        </div>
      ))}
    </details>
  );
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const dt = Date.now() - t;
  if (Number.isNaN(dt)) return iso;
  const hours = Math.round(dt / 3600_000);
  if (hours < 1) return "<1h ago";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

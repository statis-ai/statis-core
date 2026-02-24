"use client";

import { useEffect, useState } from "react";
import type { DeliveryRecord } from "@/lib/api";
import { fetchDeliveries } from "@/lib/api";

interface Props {
  entityType: string;
  entityId: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-brand-warn",
  sent: "text-brand-success",
  dead_letter: "text-brand-error",
};

export default function DeliveriesTab({ entityType, entityId }: Props) {
  const [rows, setRows] = useState<DeliveryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDeliveries(entityType, entityId)
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading) return <p className="text-brand-muted animate-pulse">Loading deliveries…</p>;
  if (error) return <p className="text-brand-error">{error}</p>;
  if (rows.length === 0) return <p className="text-brand-muted">No deliveries found.</p>;

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border text-left text-xs font-medium text-brand-muted uppercase tracking-wider">
            <th className="px-3 py-2">Subscription</th>
            <th className="px-3 py-2">Version</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Attempts</th>
            <th className="px-3 py-2">Sent At</th>
            <th className="px-3 py-2">Last Error</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {rows.map((d) => (
            <tr key={d.delivery_id} className="hover:bg-brand-surface/60 transition-colors">
              <td className="px-3 py-2 font-mono text-xs truncate max-w-[10rem]">
                {d.subscription_id}
              </td>
              <td className="px-3 py-2">{d.state_version}</td>
              <td className={`px-3 py-2 font-semibold ${STATUS_COLORS[d.status] ?? "text-white"}`}>
                {d.status}
              </td>
              <td className="px-3 py-2">{d.attempt_count}</td>
              <td className="px-3 py-2 text-xs text-brand-muted">
                {d.sent_at ? new Date(d.sent_at).toLocaleString() : "—"}
              </td>
              <td className="px-3 py-2 text-xs text-brand-error truncate max-w-[14rem]">
                {d.last_error ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

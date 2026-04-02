"use client";

import { useEffect, useState } from "react";
import type { DeliveryRecord } from "@/lib/api";
import { fetchDeliveries } from "@/lib/api";

interface Props {
  entityType: string;
  entityId: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-orange-400",
  sent: "text-emerald-400",
  dead_letter: "text-red-400",
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

  if (loading) return <p className="p-6 text-[#888888] animate-pulse">Loading deliveries…</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;
  if (rows.length === 0) return <p className="p-6 text-[#888888]">No deliveries found.</p>;

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a] text-left text-xs font-medium text-[#444444] uppercase tracking-wider">
            <th className="px-4 py-3">Subscription</th>
            <th className="px-4 py-3">Version</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Attempts</th>
            <th className="px-4 py-3">Sent At</th>
            <th className="px-4 py-3">Last Error</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {rows.map((d) => (
            <tr key={d.delivery_id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-[#888888] truncate max-w-[10rem]">{d.subscription_id}</td>
              <td className="px-4 py-3 text-white">{d.state_version}</td>
              <td className={`px-4 py-3 font-semibold ${STATUS_COLORS[d.status] ?? "text-white"}`}>{d.status}</td>
              <td className="px-4 py-3 text-white">{d.attempt_count}</td>
              <td className="px-4 py-3 text-xs text-[#888888]">{d.sent_at ? new Date(d.sent_at).toLocaleString() : "—"}</td>
              <td className="px-4 py-3 text-xs text-red-400 truncate max-w-[14rem]">{d.last_error ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

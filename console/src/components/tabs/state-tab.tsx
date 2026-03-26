"use client";

import { useEffect, useState } from "react";
import type { EntityState } from "@/lib/api";
import { fetchState } from "@/lib/api";

interface Props {
  entityType: string;
  entityId: string;
}

export default function StateTab({ entityType, entityId }: Props) {
  const [data, setData] = useState<EntityState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchState(entityType, entityId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading) return <p className="text-brand-muted animate-pulse">Loading state…</p>;
  if (error) return <p className="text-brand-error">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Metadata row */}
      <div className="flex flex-wrap gap-4 text-sm">
        <MetaChip label="Revision" value={String(data.state_version)} />
        <MetaChip label="Hash" value={data.state_hash ?? "—"} mono />
        <MetaChip label="Last Event" value={data.last_event_id ?? "—"} mono />
      </div>

      {/* State JSON */}
      <div>
        <h3 className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
          State
        </h3>
        <pre
          data-testid="state-json"
          className="rounded border border-brand-border bg-[#0a0a14] p-4
                     text-xs font-mono text-[#00ffc8] overflow-auto max-h-[28rem]"
        >
          {JSON.stringify(data.state, null, 2)}
        </pre>
      </div>

      {/* Provenance */}
      <div>
        <h3 className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
          Provenance ({data.provenance.length} event{data.provenance.length !== 1 ? "s" : ""})
        </h3>
        <ol className="list-decimal list-inside space-y-0.5 text-xs font-mono text-brand-muted">
          {data.provenance.map((eid, i) => (
            <li key={i}>{eid}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function MetaChip({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded border border-brand-border bg-[#0a0a14] px-3 py-2">
      <span className="text-brand-muted text-xs uppercase tracking-wider">{label}</span>
      <p className={`mt-0.5 text-white text-sm ${mono ? "font-mono" : ""} truncate max-w-[20rem]`}>
        {value}
      </p>
    </div>
  );
}

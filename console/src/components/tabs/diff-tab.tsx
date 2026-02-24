"use client";

import { useState } from "react";
import { fetchStateAtRev } from "@/lib/api";
import { diff as computeJsonDiff } from "jsondiffpatch";
import { format as formatHtml } from "jsondiffpatch/formatters/html";

interface Props {
  entityType: string;
  entityId: string;
}

type DiffResult = { html: string } | "identical" | null;

export default function DiffTab({ entityType, entityId }: Props) {
  const [fromRev, setFromRev] = useState("1");
  const [toRev, setToRev] = useState("2");
  const [result, setResult] = useState<DiffResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function compare() {
    const from = parseInt(fromRev, 10);
    const to = parseInt(toRev, 10);
    if (isNaN(from) || isNaN(to) || from < 1 || to < 1 || from === to) {
      setError("Enter two different positive revision numbers.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const [stateA, stateB] = await Promise.all([
        fetchStateAtRev(entityType, entityId, from),
        fetchStateAtRev(entityType, entityId, to),
      ]);
      const delta = computeJsonDiff(stateA.state, stateB.state);
      if (!delta) {
        setResult("identical");
      } else {
        setResult({ html: formatHtml(delta, stateA.state) ?? "" });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3">
        <RevInput label="From Rev" value={fromRev} onChange={setFromRev} />
        <RevInput label="To Rev" value={toRev} onChange={setToRev} />
        <button
          onClick={compare}
          disabled={loading}
          className="h-10 px-5 rounded bg-brand-accent text-brand-statist text-sm font-semibold
                     hover:bg-brand-accent/90 disabled:opacity-40 transition-colors"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {error && <p className="text-brand-error text-sm">{error}</p>}

      {result === "identical" && (
        <p className="text-brand-muted text-sm">States are identical at these revisions.</p>
      )}

      {result && result !== "identical" && (
        <div>
          <h3 className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">
            Changes (rev {fromRev} → {toRev})
          </h3>
          <div
            className="rounded border border-brand-border bg-brand-statist p-4
                       text-xs font-mono overflow-auto max-h-[28rem]"
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        </div>
      )}
    </div>
  );
}

function RevInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
        {label}
      </label>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-24 rounded border border-brand-border bg-brand-surface px-3 text-sm
                   text-white outline-none focus:border-brand-accent focus:ring-1
                   focus:ring-brand-accent/30 transition-colors"
      />
    </div>
  );
}

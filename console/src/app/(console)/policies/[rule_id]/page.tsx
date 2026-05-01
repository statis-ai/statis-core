"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPolicyRule,
  fetchReceiptsByRule,
  updatePolicyRule,
  simulateAction,
  type PolicyRule,
  type ReceiptDetail,
  type SimulateResult,
} from "@/lib/api";
import { StatusPill } from "@/components/observe/StatusPill";
import { HBarList } from "@/components/observe/HBarList";

type Tab = "overview" | "fires";

function formatAbsolute(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2 border-b border-brand-rule-soft last:border-0">
      <span className="font-mono text-brand-muted shrink-0 w-36" style={{ fontSize: 11 }}>{label}</span>
      <div className="text-brand-ink-soft flex-1" style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

export default function PolicyDetailPage({
  params,
}: {
  params: Promise<{ rule_id: string }>;
}) {
  const { rule_id } = use(params);

  const [rule, setRule] = useState<PolicyRule | null>(null);
  const [receipts, setReceipts] = useState<ReceiptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Simulator state
  const [simParams, setSimParams] = useState("{}");
  const [simEntity, setSimEntity] = useState("{}");
  const [simResult, setSimResult] = useState<SimulateResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  // Active toggle state
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [r, fires] = await Promise.allSettled([
          fetchPolicyRule(rule_id),
          fetchReceiptsByRule(rule_id, 20),
        ]);
        if (cancelled) return;
        if (r.status === "fulfilled") setRule(r.value);
        else throw new Error(String(r.reason));
        if (fires.status === "fulfilled") setReceipts(fires.value);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [rule_id]);

  async function handleToggleActive() {
    if (!rule) return;
    setToggling(true);
    try {
      const updated = await updatePolicyRule(rule_id, { active: !rule.active });
      setRule(updated);
    } catch { /* ignore */ }
    finally { setToggling(false); }
  }

  async function handleSimulate() {
    setSimLoading(true);
    setSimResult(null);
    setSimError(null);
    try {
      let parsedParams: Record<string, unknown>;
      let parsedEntity: Record<string, unknown>;
      try {
        parsedParams = JSON.parse(simParams);
        parsedEntity = JSON.parse(simEntity);
      } catch {
        setSimError("Invalid JSON in parameters or entity state");
        return;
      }
      const result = await simulateAction({
        action_type: rule?.action_type ?? "",
        parameters: parsedParams,
        entity_state: parsedEntity,
      });
      setSimResult(result);
    } catch (err) {
      setSimError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setSimLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8"><p className="font-mono text-brand-muted" style={{ fontSize: 13 }}>Loading...</p></div>;
  }

  if (error || !rule) {
    return <div className="p-8"><p className="font-mono text-brand-bad" style={{ fontSize: 13 }}>{error ?? "Policy not found"}</p></div>;
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "fires", label: `Fires (${receipts.length})` },
  ];

  return (
    <div className="p-6 max-w-4xl flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-brand-muted" style={{ fontSize: 12 }}>
        <Link href="/policies" className="hover:text-brand-accent transition-colors">Policies</Link>
        <span>/</span>
        <span className="text-brand-ink">{rule_id}</span>
      </div>

      {/* Header */}
      <div className="bg-brand-paper border border-brand-rule p-5 flex items-start justify-between gap-4" style={{ borderRadius: "var(--radius)" }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="font-mono text-brand-ink" style={{ fontSize: 16, fontWeight: 500 }}>{rule_id}</p>
            {rule.source === "graduated" && (
              <span
                className="font-mono border border-brand-accent text-brand-accent"
                style={{ fontSize: 10, borderRadius: "var(--radius-sm)", padding: "2px 6px" }}
              >
                graduated
              </span>
            )}
          </div>
          <p className="font-mono text-brand-muted" style={{ fontSize: 13 }}>{rule.action_type}</p>
          <div className="flex items-center gap-3 mt-1">
            <StatusPill status={rule.decision} />
            <span className="font-mono text-brand-subtle" style={{ fontSize: 11 }}>
              v{rule.rule_version} · priority {rule.priority}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleToggleActive}
            disabled={toggling}
            className="font-mono border transition-colors disabled:opacity-40"
            style={{
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: "var(--radius-sm)",
              background: rule.active ? "var(--accent-tint)" : "transparent",
              borderColor: rule.active ? "var(--accent)" : "var(--rule)",
              color: rule.active ? "var(--accent)" : "var(--ink-muted)",
            }}
          >
            {toggling ? "…" : rule.active ? "Active" : "Inactive"}
          </button>
          <span className="font-mono text-brand-subtle" style={{ fontSize: 11 }}>
            {formatAbsolute(rule.created_at)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-brand-rule">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="font-mono transition-colors"
            style={{
              fontSize: 12,
              padding: "8px 16px",
              borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === t.id ? "var(--accent)" : "var(--ink-muted)",
              letterSpacing: "0.06em",
              background: "none",
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="bg-brand-paper border border-brand-rule" style={{ borderRadius: "var(--radius)" }}>
          <div className="p-5">
            {rule.description && (
              <p className="text-brand-ink-soft mb-4" style={{ fontSize: 14 }}>{rule.description}</p>
            )}
            <FieldRow label="Decision" value={<StatusPill status={rule.decision} />} />
            <FieldRow label="Action type" value={<span className="font-mono text-brand-ink-soft" style={{ fontSize: 13 }}>{rule.action_type}</span>} />
            <FieldRow label="Priority" value={<span className="font-mono text-brand-muted" style={{ fontSize: 13 }}>{rule.priority}</span>} />
            <FieldRow label="Version" value={<span className="font-mono text-brand-muted" style={{ fontSize: 13 }}>{rule.rule_version}</span>} />
            {rule.graduated_from_action_id && (
              <FieldRow label="Graduated from" value={
                <Link href={`/actions/${rule.graduated_from_action_id}`} className="font-mono text-brand-accent hover:text-brand-accent-deep transition-colors" style={{ fontSize: 13 }}>
                  {rule.graduated_from_action_id}
                </Link>
              } />
            )}
            <div className="mt-4">
              <p className="eyebrow mb-3">Conditions</p>
              <pre
                className="font-mono text-brand-muted bg-brand-deep border border-brand-rule p-4 overflow-x-auto"
                style={{ fontSize: 12, lineHeight: 1.6, borderRadius: "var(--radius-sm)" }}
              >
                {JSON.stringify(rule.conditions, null, 2)}
              </pre>
            </div>

            {/* Inline simulator */}
            <div className="mt-6 pt-5 border-t border-brand-rule">
              <p className="eyebrow mb-3">Simulator</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-brand-muted mb-1" style={{ fontSize: 11 }}>Parameters (JSON)</p>
                  <textarea
                    value={simParams}
                    onChange={(e) => setSimParams(e.target.value)}
                    rows={5}
                    className="w-full font-mono text-brand-ink-soft bg-brand-bg border border-brand-rule p-3"
                    style={{ fontSize: 12, borderRadius: "var(--radius-sm)", resize: "vertical" }}
                  />
                </div>
                <div>
                  <p className="font-mono text-brand-muted mb-1" style={{ fontSize: 11 }}>Entity state (JSON)</p>
                  <textarea
                    value={simEntity}
                    onChange={(e) => setSimEntity(e.target.value)}
                    rows={5}
                    className="w-full font-mono text-brand-ink-soft bg-brand-bg border border-brand-rule p-3"
                    style={{ fontSize: 12, borderRadius: "var(--radius-sm)", resize: "vertical" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={handleSimulate} disabled={simLoading} className="btn-primary py-2" style={{ fontSize: 11 }}>
                  {simLoading ? "Running…" : "Run simulation"}
                </button>
                {simError && <p className="font-mono text-brand-bad" style={{ fontSize: 12 }}>{simError}</p>}
                {simResult && (
                  <div className="flex items-center gap-3">
                    <StatusPill status={simResult.decision} />
                    <span className="font-mono text-brand-muted" style={{ fontSize: 12 }}>
                      {simResult.rule_id ? `rule: ${simResult.rule_id}` : simResult.reason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "fires" && (
        <div className="bg-brand-paper border border-brand-rule" style={{ borderRadius: "var(--radius)" }}>
          {receipts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-mono text-brand-muted" style={{ fontSize: 13 }}>No receipt history yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {["Action", "Decision", "Executed", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-mono uppercase text-brand-muted border-b border-brand-rule" style={{ fontSize: 10, letterSpacing: "0.12em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.receipt_id} className="border-b border-brand-rule-soft last:border-0 hover:bg-brand-deep transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/actions/${r.action_id}`} className="font-mono text-brand-accent hover:text-brand-accent-deep transition-colors" style={{ fontSize: 12 }}>
                        {r.action_id.slice(0, 14)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={r.decision} />
                    </td>
                    <td className="px-5 py-3 font-mono text-brand-muted" style={{ fontSize: 12 }}>
                      {r.executed_at ? timeAgo(r.executed_at) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/receipts/${r.receipt_id}`} className="font-mono text-brand-muted hover:text-brand-accent transition-colors" style={{ fontSize: 11 }}>
                        Receipt →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

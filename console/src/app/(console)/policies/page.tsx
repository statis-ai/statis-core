"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Shield,
  ChevronRight,
  Trash2,
  X,
  FlaskConical,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CircleAlert,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchPolicyRules,
  createPolicyRule,
  updatePolicyRule,
  deletePolicyRule,
  simulateAction,
  type PolicyRule,
  type PolicyRuleCreate,
  type PolicyRuleUpdate,
  type SimulateResult,
} from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

function priorityLabel(p: number): string {
  if (p >= 90) return "critical";
  if (p >= 50) return "high";
  return "medium";
}

const DECISION_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  DENIED: "bg-red-500/15 text-red-400 border-red-500/20",
  ESCALATED: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

const inputCls =
  "w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#111111] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20";
const selectCls =
  "w-full text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-white/20";

interface Draft {
  rule_id: string;
  action_type: string;
  conditions: string;
  decision: string;
  priority: number;
  description: string;
  active: boolean;
}

const BLANK_DRAFT: Draft = {
  rule_id: "",
  action_type: "",
  conditions: "{}",
  decision: "APPROVED",
  priority: 50,
  description: "",
  active: true,
};

function draftFromRule(rule: PolicyRule): Draft {
  return {
    rule_id: rule.rule_id,
    action_type: rule.action_type,
    conditions: JSON.stringify(rule.conditions, null, 2),
    decision: rule.decision,
    priority: rule.priority,
    description: rule.description ?? "",
    active: rule.active,
  };
}

function PolicyCard({
  rule,
  onEdit,
  onDelete,
  onToggleActive,
  onTest,
}: {
  rule: PolicyRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onTest: () => void;
}) {
  const pLabel = priorityLabel(rule.priority);
  const isGraduated = rule.source === "graduated";
  return (
    <div
      className="rounded-xl p-6 transition-colors"
      style={{
        background: "var(--bg-surface)",
        border: isGraduated
          ? "1px solid rgba(139,92,246,0.35)"
          : "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: isGraduated
                ? "rgba(139,92,246,0.12)"
                : "color-mix(in srgb, var(--text) 5%, transparent)",
              border: isGraduated
                ? "1px solid rgba(139,92,246,0.30)"
                : "1px solid var(--border)",
              color: isGraduated ? "#a78bfa" : "var(--text-2)",
            }}
          >
            {isGraduated ? <Sparkles size={15} /> : <Shield size={15} />}
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-white">
              {rule.rule_id}
            </h3>
            <p className="font-mono text-[11px] text-[#444444] mt-0.5">
              {rule.action_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGraduated && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide"
              style={{
                background: "rgba(139,92,246,0.12)",
                color: "#a78bfa",
                borderColor: "rgba(139,92,246,0.30)",
              }}
              title={
                rule.graduated_from_action_id
                  ? `Auto-drafted from ${rule.graduated_from_action_id}`
                  : "Auto-drafted from 3 prior approvals"
              }
            >
              Graduated
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide",
              PRIORITY_STYLES[pLabel] ?? PRIORITY_STYLES.medium
            )}
          >
            {pLabel} ({rule.priority})
          </span>
          <span className="text-[10px] font-mono text-[#444444] bg-white/[0.04] border border-[#1a1a1a] px-2 py-0.5 rounded">
            {rule.rule_version}
          </span>
          <button
            onClick={onToggleActive}
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border cursor-pointer transition-colors",
              rule.active
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
                : "bg-white/5 text-[#444444] border-[#1a1a1a] hover:text-[#888888]"
            )}
          >
            {rule.active ? "Active" : "Inactive"}
          </button>
        </div>
      </div>

      {rule.description && (
        <p className="text-xs text-[#888888] mb-3">{rule.description}</p>
      )}

      {isGraduated && rule.graduated_from_action_id && (
        <p className="text-[11px] font-mono text-[#666666] mb-3">
          auto-drafted from{" "}
          <a
            href={`/inspector?action_id=${rule.graduated_from_action_id}`}
            className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
          >
            {rule.graduated_from_action_id}
          </a>
        </p>
      )}

      <div className="bg-[#0a0a0a] rounded p-4 font-mono text-xs space-y-1.5 border border-[#1a1a1a]">
        <div className="text-[#888888] whitespace-pre-wrap break-all">
          {JSON.stringify(rule.conditions, null, 2)}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-[#1a1a1a] mt-2">
          <span className="text-[#444444] w-8 text-right shrink-0">-&gt;</span>
          <span
            className={cn(
              "font-semibold px-2 py-0.5 rounded text-[11px] border",
              DECISION_STYLES[rule.decision] ?? ""
            )}
          >
            {rule.decision}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onDelete}
          className="text-xs text-[#444444] hover:text-red-400 transition-colors"
        >
          Delete
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onTest}
            className="flex items-center gap-1 text-xs text-[#555555] hover:text-[#888888] transition-colors"
          >
            <FlaskConical size={12} />
            Test
          </button>
          <Link
            href={`/policies/${rule.rule_id}`}
            className="flex items-center gap-1 text-xs font-mono font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Detail <ChevronRight size={12} />
          </Link>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-[#d4d4d4] font-medium hover:text-white transition-colors"
          >
            Edit rule <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

type PanelMode =
  | { kind: "new" }
  | { kind: "edit"; ruleId: string };

export default function PoliciesPage() {
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelMode | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);
  const [testingRule, setTestingRule] = useState<PolicyRule | null>(null);
  const [testEntityState, setTestEntityState] = useState("{}");
  const [testParameters, setTestParameters] = useState("{}");
  const [testResult, setTestResult] = useState<SimulateResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [graduatedOnly, setGraduatedOnly] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPolicyRules();
      setRules(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load policies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setDraft(BLANK_DRAFT);
    setPanel({ kind: "new" });
  }

  function openEdit(rule: PolicyRule) {
    setDraft(draftFromRule(rule));
    setPanel({ kind: "edit", ruleId: rule.rule_id });
  }

  async function handleSave() {
    setSaving(true);
    try {
      let conditions: Record<string, unknown>;
      try {
        conditions = JSON.parse(draft.conditions);
      } catch {
        setError("Invalid JSON in conditions");
        setSaving(false);
        return;
      }

      if (panel?.kind === "new") {
        const payload: PolicyRuleCreate = {
          rule_id: draft.rule_id,
          action_type: draft.action_type,
          conditions,
          decision: draft.decision,
          priority: draft.priority,
          active: draft.active,
          description: draft.description || undefined,
        };
        await createPolicyRule(payload);
      } else if (panel?.kind === "edit") {
        const payload: PolicyRuleUpdate = {
          action_type: draft.action_type,
          conditions,
          decision: draft.decision,
          priority: draft.priority,
          active: draft.active,
          description: draft.description || undefined,
        };
        await updatePolicyRule(panel.ruleId, payload);
      }
      setPanel(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ruleId: string) {
    if (!confirm(`Delete rule "${ruleId}"?`)) return;
    try {
      await deletePolicyRule(ruleId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function openTest(rule: PolicyRule) {
    setTestingRule(rule);
    setTestEntityState("{}");
    setTestParameters("{}");
    setTestResult(null);
    setTestError(null);
  }

  async function handleTest() {
    if (!testingRule) return;
    setTestLoading(true);
    setTestResult(null);
    setTestError(null);
    try {
      let entityState: Record<string, unknown>;
      let parameters: Record<string, unknown>;
      try {
        entityState = JSON.parse(testEntityState);
        parameters = JSON.parse(testParameters);
      } catch {
        setTestError("Invalid JSON in entity state or parameters");
        setTestLoading(false);
        return;
      }
      const result = await simulateAction({
        action_type: testingRule.action_type,
        entity_state: entityState,
        parameters,
      });
      setTestResult(result);
    } catch (err: unknown) {
      setTestError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setTestLoading(false);
    }
  }

  async function handleToggleActive(rule: PolicyRule) {
    try {
      await updatePolicyRule(rule.rule_id, { active: !rule.active });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    }
  }

  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.active).length;
    const approveRules = rules.filter((r) => r.decision === "APPROVED").length;
    const denyRules = rules.filter((r) => r.decision === "DENIED").length;
    const escalateRules = rules.filter((r) => r.decision === "ESCALATED").length;
    const graduatedRules = rules.filter((r) => r.source === "graduated").length;
    return { total, active, approveRules, denyRules, escalateRules, graduatedRules };
  }, [rules]);

  const displayedRules = useMemo(
    () => (graduatedOnly ? rules.filter((r) => r.source === "graduated") : rules),
    [rules, graduatedOnly]
  );

  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Policies"
        subtitle={
          loading ? (
            "Loading policy rules…"
          ) : (
            <span>
              {stats.total.toLocaleString()} rule{stats.total !== 1 ? "s" : ""} ·{" "}
              <span style={{ color: "#34D399" }}>{stats.active} active</span>
            </span>
          )
        }
        actions={
          <>
            {stats.graduatedRules > 0 && (
              <button
                type="button"
                onClick={() => setGraduatedOnly((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors"
                style={{
                  color: graduatedOnly ? "#a78bfa" : "var(--text-2)",
                  background: graduatedOnly
                    ? "rgba(139,92,246,0.12)"
                    : "color-mix(in srgb, var(--text) 4%, transparent)",
                  border: graduatedOnly
                    ? "1px solid rgba(139,92,246,0.30)"
                    : "1px solid var(--border)",
                }}
                title="Show only auto-graduated rules"
              >
                <Sparkles size={12} />
                Graduated{graduatedOnly ? ` (${stats.graduatedRules})` : ""}
              </button>
            )}
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors"
              style={{
                color: "var(--text-2)",
                background: "color-mix(in srgb, var(--text) 4%, transparent)",
                border: "1px solid var(--border)",
              }}
              title="Refresh"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-1.5 text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors"
              style={{
                color: "#FB923C",
                background: "rgba(251,146,60,0.08)",
                border: "1px solid rgba(251,146,60,0.35)",
              }}
            >
              <Plus size={13} />
              New rule
            </button>
          </>
        }
      />

      {error && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-[12px] font-mono flex items-center gap-3"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            color: "#F87171",
          }}
        >
          <CircleAlert size={14} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto underline opacity-70 hover:opacity-100"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Stat tiles */}
      <div className="mb-6">
        <StatTileGrid>
          <StatTile
            label="Total rules"
            value={loading ? "…" : stats.total.toLocaleString()}
            hint={`${stats.active} active`}
            icon={<Shield size={13} />}
          />
          <StatTile
            label="Approve rules"
            value={loading ? "…" : stats.approveRules.toLocaleString()}
            trend="up"
            hint="Auto-approved actions"
            icon={<CheckCircle2 size={13} />}
          />
          <StatTile
            label="Escalate rules"
            value={loading ? "…" : stats.escalateRules.toLocaleString()}
            hint="Routed to humans"
            icon={<FlaskConical size={13} />}
          />
          <StatTile
            label="Deny rules"
            value={loading ? "…" : stats.denyRules.toLocaleString()}
            trend={stats.denyRules > 0 ? "down" : "neutral"}
            hint="Blocked at the gate"
            icon={<XCircle size={13} />}
          />
        </StatTileGrid>
      </div>

      {loading ? (
        <div
          className="flex flex-col gap-3 p-1"
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-6 animate-pulse"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="h-4 w-48 rounded mb-2"
                style={{
                  background: "color-mix(in srgb, var(--text) 6%, transparent)",
                }}
              />
              <div
                className="h-3 w-32 rounded"
                style={{
                  background: "color-mix(in srgb, var(--text) 4%, transparent)",
                }}
              />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center text-center py-16 px-6"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: "color-mix(in srgb, var(--text) 4%, transparent)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <Shield size={18} />
          </div>
          <p
            className="text-[14px] font-semibold mb-1.5"
            style={{ color: "var(--text)" }}
          >
            No policy rules configured
          </p>
          <p
            className="text-[12px] max-w-sm mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Every agent action needs at least one rule. Start with a catch-all approve
            rule, then harden from there.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-full font-semibold transition-colors"
            style={{
              color: "#FB923C",
              background: "rgba(251,146,60,0.08)",
              border: "1px solid rgba(251,146,60,0.35)",
            }}
          >
            <Plus size={13} />
            Create your first rule
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedRules.map((rule) => (
            <PolicyCard
              key={rule.rule_id + rule.rule_version}
              rule={rule}
              onEdit={() => openEdit(rule)}
              onDelete={() => handleDelete(rule.rule_id)}
              onToggleActive={() => handleToggleActive(rule)}
              onTest={() => openTest(rule)}
            />
          ))}
        </div>
      )}

      {/* Test modal */}
      {testingRule && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
              <div>
                <p className="text-sm font-semibold text-white">Test Policy</p>
                <p className="font-mono text-[11px] text-[#444444] mt-0.5">
                  {testingRule.action_type}
                </p>
              </div>
              <button
                onClick={() => setTestingRule(null)}
                className="text-[#444444] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                  Entity State (JSON)
                </label>
                <textarea
                  rows={4}
                  value={testEntityState}
                  onChange={(e) => setTestEntityState(e.target.value)}
                  className={cn(inputCls, "resize-y")}
                  placeholder='{"churn_risk": true, "ltv": 1500}'
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                  Parameters (JSON)
                </label>
                <textarea
                  rows={3}
                  value={testParameters}
                  onChange={(e) => setTestParameters(e.target.value)}
                  className={cn(inputCls, "resize-y")}
                  placeholder='{"discount_pct": 20}'
                />
              </div>
              {testError && (
                <p className="text-xs text-red-400 font-mono">{testError}</p>
              )}
              {testResult && (
                <div className="bg-[#0a0a0a] rounded border border-[#1a1a1a] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded border",
                        DECISION_STYLES[testResult.decision] ?? ""
                      )}
                    >
                      {testResult.decision}
                    </span>
                    {testResult.rule_id && (
                      <span className="font-mono text-[11px] text-[#555555]">
                        {testResult.rule_id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#888888]">{testResult.reason}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#1a1a1a] flex gap-3">
              <button
                onClick={handleTest}
                disabled={testLoading}
                className="flex-1 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40"
              >
                {testLoading ? "Running..." : "Run simulation"}
              </button>
              <button
                onClick={() => setTestingRule(null)}
                className="px-4 py-2 rounded border border-[#1a1a1a] text-[#888888] text-sm hover:text-white hover:border-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in panel for new/edit */}
      {panel && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-[#111111] border-l border-[#1a1a1a] shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
            <div>
              <p className="text-sm font-semibold text-white">
                {panel.kind === "new" ? "New rule" : `Edit ${panel.ruleId}`}
              </p>
              <p className="text-xs text-[#444444] mt-0.5">
                {panel.kind === "new"
                  ? "Define conditions and outcome"
                  : "Update rule configuration"}
              </p>
            </div>
            <button
              onClick={() => setPanel(null)}
              className="text-[#444444] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Rule ID
              </label>
              <input
                placeholder="e.g. churn_retention_v1"
                value={draft.rule_id}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, rule_id: e.target.value }))
                }
                disabled={panel.kind === "edit"}
                className={cn(
                  inputCls,
                  panel.kind === "edit" && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Action type
              </label>
              <input
                placeholder="e.g. apply_discount"
                value={draft.action_type}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, action_type: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Description
              </label>
              <input
                placeholder="Optional description"
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      priority: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                  Decision
                </label>
                <select
                  value={draft.decision}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, decision: e.target.value }))
                  }
                  className={selectCls}
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="DENIED">DENIED</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Conditions (JSON)
              </label>
              <textarea
                rows={8}
                value={draft.conditions}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, conditions: e.target.value }))
                }
                className={cn(inputCls, "resize-y")}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active-toggle"
                checked={draft.active}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, active: e.target.checked }))
                }
                className="accent-[#d4d4d4]"
              />
              <label
                htmlFor="active-toggle"
                className="text-xs text-[#888888]"
              >
                Active
              </label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#1a1a1a] flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !draft.rule_id || !draft.action_type}
              className="flex-1 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : panel.kind === "new"
                ? "Create rule"
                : "Save changes"}
            </button>
            <button
              onClick={() => setPanel(null)}
              className="px-4 py-2 rounded border border-[#1a1a1a] text-[#888888] text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

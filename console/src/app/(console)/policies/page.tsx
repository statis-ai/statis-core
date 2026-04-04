"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Shield, ChevronRight, Trash2, X, FlaskConical } from "lucide-react";
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
  return (
    <div className="bg-[#111111] rounded border border-[#1a1a1a] p-6 hover:border-white/[0.1] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/[0.06] flex items-center justify-center">
            <Shield size={15} className="text-[#d4d4d4]" />
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

  if (loading) {
    return (
      <div className="p-8 max-w-4xl">
        <p className="text-sm text-[#888888]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Policies</h1>
          <p className="text-xs text-[#444444] mt-0.5">
            {rules.length} rules -- {rules.filter((r) => r.active).length}{" "}
            active
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors"
        >
          <Plus size={14} />
          New rule
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-red-400/60 hover:text-red-400"
          >
            dismiss
          </button>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="text-center py-16 text-[#444444] text-sm">
          No policy rules configured
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rules.map((rule) => (
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

"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Shield,
  Pencil,
  Trash2,
  X,
  FlaskConical,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CircleAlert,
  Sparkles,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  fetchPolicyRules,
  fetchAnalyticsSummary,
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
import { StatusPill } from "@/components/observe/StatusPill";
import { KPITile } from "@/components/observe/KPITile";
import { DataTableShell, DataTableEmpty } from "@/components/observe/DataTableShell";

// ── shared form style tokens ──────────────────────────────────────────────
const inputCls =
  "w-full font-mono text-sm px-3 py-2 bg-brand-bg border border-brand-rule text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-accent";
const selectCls =
  "w-full font-mono text-sm px-3 py-2 bg-brand-bg border border-brand-rule text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-accent";

// ── Draft ─────────────────────────────────────────────────────────────────
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

function draftFromRule(r: PolicyRule): Draft {
  return {
    rule_id: r.rule_id,
    action_type: r.action_type,
    conditions: JSON.stringify(r.conditions, null, 2),
    decision: r.decision,
    priority: r.priority,
    description: r.description ?? "",
    active: r.active,
  };
}

// ── Mini fires bar ────────────────────────────────────────────────────────
function FiresBar({ fires, maxFires }: { fires: number; maxFires: number }) {
  const pct = maxFires > 0 ? Math.max((fires / maxFires) * 100, fires > 0 ? 4 : 0) : 0;
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: 56,
          height: 5,
          background: "var(--bg-deep)",
          borderRadius: 3,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent)",
            opacity: 0.65,
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span className="font-mono text-brand-muted" style={{ fontSize: 11, minWidth: 20 }}>
        {fires}
      </span>
    </div>
  );
}

// ── Panel mode ────────────────────────────────────────────────────────────
type PanelMode = { kind: "new" } | { kind: "edit"; ruleId: string };

// ── Main page ─────────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [firesMap, setFiresMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
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
      const [rulesData, analytics] = await Promise.allSettled([
        fetchPolicyRules(),
        fetchAnalyticsSummary(7),
      ]);
      if (rulesData.status === "fulfilled") setRules(rulesData.value);
      if (analytics.status === "fulfilled") {
        const map: Record<string, number> = {};
        for (const r of analytics.value.top_rules) map[r.rule_id] = r.fires;
        setFiresMap(map);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived data ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: rules.length,
    active: rules.filter((r) => r.active).length,
    approveRules: rules.filter((r) => r.decision === "APPROVED").length,
    denyRules: rules.filter((r) => r.decision === "DENIED").length,
    escalateRules: rules.filter((r) => r.decision === "ESCALATED").length,
  }), [rules]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter(
      (r) =>
        r.rule_id.toLowerCase().includes(q) ||
        r.action_type.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
    );
  }, [rules, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, PolicyRule[]>();
    for (const r of filtered) {
      const key = r.action_type || "(no action type)";
      (map.get(key) ?? map.set(key, []).get(key)!).push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const maxFires = useMemo(
    () => Math.max(...Object.values(firesMap), 1),
    [firesMap]
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  function openNew() { setDraft(BLANK_DRAFT); setPanel({ kind: "new" }); }
  function openEdit(rule: PolicyRule) { setDraft(draftFromRule(rule)); setPanel({ kind: "edit", ruleId: rule.rule_id }); }
  function openTest(rule: PolicyRule) {
    setTestingRule(rule);
    setTestEntityState("{}");
    setTestParameters("{}");
    setTestResult(null);
    setTestError(null);
  }

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      let conditions: Record<string, unknown>;
      try { conditions = JSON.parse(draft.conditions); }
      catch { setError("Invalid JSON in conditions"); setSaving(false); return; }

      if (panel?.kind === "new") {
        const payload: PolicyRuleCreate = {
          rule_id: draft.rule_id, action_type: draft.action_type, conditions,
          decision: draft.decision, priority: draft.priority, active: draft.active,
          description: draft.description || undefined,
        };
        await createPolicyRule(payload);
      } else if (panel?.kind === "edit") {
        const payload: PolicyRuleUpdate = {
          action_type: draft.action_type, conditions, decision: draft.decision,
          priority: draft.priority, active: draft.active,
          description: draft.description || undefined,
        };
        await updatePolicyRule(panel.ruleId, payload);
      }
      setPanel(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function handleDelete(ruleId: string) {
    if (!confirm(`Delete rule "${ruleId}"?`)) return;
    try { await deletePolicyRule(ruleId); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); }
  }

  async function handleToggleActive(rule: PolicyRule) {
    try { await updatePolicyRule(rule.rule_id, { active: !rule.active }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Toggle failed"); }
  }

  async function handleTest() {
    if (!testingRule) return;
    setTestLoading(true); setTestResult(null); setTestError(null);
    try {
      let entityState: Record<string, unknown>;
      let parameters: Record<string, unknown>;
      try {
        entityState = JSON.parse(testEntityState);
        parameters = JSON.parse(testParameters);
      } catch { setTestError("Invalid JSON"); setTestLoading(false); return; }
      setTestResult(await simulateAction({ action_type: testingRule.action_type, entity_state: entityState, parameters }));
    } catch (err) { setTestError(err instanceof Error ? err.message : "Simulation failed"); }
    finally { setTestLoading(false); }
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Policies"
        subtitle={
          loading ? "Loading…" : (
            <span className="font-mono text-brand-muted" style={{ fontSize: 12 }}>
              {stats.total} rule{stats.total !== 1 ? "s" : ""} · {" "}
              <span style={{ color: "var(--good)" }}>{stats.active} active</span>
            </span>
          )
        }
        actions={
          <>
            <button
              type="button" onClick={load}
              className="inline-flex items-center gap-1.5 font-mono transition-colors text-brand-muted hover:text-brand-ink border border-brand-rule px-3 py-1.5"
              style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              type="button" onClick={openNew}
              className="inline-flex items-center gap-1.5 font-mono font-medium transition-colors text-brand-paper bg-brand-accent hover:bg-brand-accent-deep px-4 py-1.5"
              style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
            >
              <Plus size={13} /> New rule
            </button>
          </>
        }
      />

      {error && (
        <div
          className="mb-5 px-4 py-3 font-mono flex items-center gap-3"
          style={{ background: "rgba(185,28,28,0.08)", border: "1px solid var(--bad)", color: "var(--bad)", borderRadius: "var(--radius)", fontSize: 12 }}
        >
          <CircleAlert size={14} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto opacity-70 hover:opacity-100 underline">dismiss</button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPITile label="Total rules" value={loading ? "…" : String(stats.total)} />
        <KPITile label="Approve rules" value={loading ? "…" : String(stats.approveRules)} />
        <KPITile label="Escalate rules" value={loading ? "…" : String(stats.escalateRules)} />
        <KPITile label="Deny rules" value={loading ? "…" : String(stats.denyRules)} />
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rule ID, action type, description…"
          className="w-full font-mono text-brand-ink bg-brand-paper border border-brand-rule pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-brand-muted"
          style={{ fontSize: 13, borderRadius: "var(--radius)" }}
        />
      </div>

      {/* Table */}
      <DataTableShell
        title={`${filtered.length} rule${filtered.length !== 1 ? "s" : ""}${search ? " matching" : ""}`}
        footer={`${stats.active} active · ${stats.total - stats.active} inactive`}
      >
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-brand-rule-soft animate-pulse">
                <div className="h-3 w-36 rounded bg-brand-deep" />
                <div className="h-3 w-24 rounded bg-brand-deep" />
                <div className="h-4 w-20 rounded bg-brand-deep" />
                <div className="h-3 w-12 rounded bg-brand-deep ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <DataTableEmpty
            icon={<Shield size={18} />}
            title={search ? "No rules match that search" : "No policy rules configured"}
            description={
              search
                ? "Try a different rule ID or action type."
                : "Every agent action needs at least one rule. Create one to get started."
            }
          />
        ) : (
          <div>
            {/* Sticky column headers */}
            <div
              className="grid px-5 py-2 sticky top-0 z-10 border-b border-brand-rule"
              style={{
                gridTemplateColumns: "1fr 80px 100px 60px 100px 80px 80px",
                background: "var(--paper)",
              }}
            >
              {["Rule ID", "Version", "Decision", "Pri", "Fires 7d", "Status", ""].map((h) => (
                <div
                  key={h}
                  className="font-mono uppercase text-brand-muted"
                  style={{ fontSize: 10, letterSpacing: "0.12em" }}
                >
                  {h}
                </div>
              ))}
            </div>

            {grouped.map(([actionType, groupRules]) => {
              const collapsed = collapsedGroups.has(actionType);
              return (
                <div key={actionType}>
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(actionType)}
                    className="w-full flex items-center gap-3 px-5 py-2 text-left border-b border-brand-rule-soft hover:bg-brand-deep transition-colors"
                    style={{ background: "var(--bg-deep)" }}
                  >
                    <ChevronDown
                      size={12}
                      className="text-brand-muted transition-transform"
                      style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                    />
                    <span
                      className="font-mono uppercase text-brand-ink"
                      style={{ fontSize: 11, letterSpacing: "0.14em" }}
                    >
                      {actionType}
                    </span>
                    <span
                      className="font-mono text-brand-muted"
                      style={{ fontSize: 10 }}
                    >
                      {groupRules.length} rule{groupRules.length !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {/* Rows */}
                  {!collapsed && groupRules.map((rule) => (
                    <div
                      key={rule.rule_id}
                      className="grid px-5 items-center border-b border-brand-rule-soft hover:bg-brand-deep transition-colors group"
                      style={{
                        gridTemplateColumns: "1fr 80px 100px 60px 100px 80px 80px",
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                    >
                      {/* Rule ID → detail page */}
                      <div className="flex items-center gap-2 min-w-0">
                        {rule.source === "graduated" && (
                          <Sparkles size={11} style={{ color: "#a78bfa", flexShrink: 0 }} />
                        )}
                        <Link
                          href={`/policies/${rule.rule_id}`}
                          className="font-mono text-brand-ink hover:text-brand-accent transition-colors truncate"
                          style={{ fontSize: 13 }}
                          title={rule.rule_id}
                        >
                          {rule.rule_id}
                        </Link>
                        {rule.description && (
                          <span className="font-mono text-brand-subtle truncate hidden group-hover:inline" style={{ fontSize: 11 }}>
                            · {rule.description}
                          </span>
                        )}
                      </div>

                      {/* Version */}
                      <div className="font-mono text-brand-muted" style={{ fontSize: 11 }}>
                        v{rule.rule_version}
                      </div>

                      {/* Decision */}
                      <div>
                        <StatusPill status={rule.decision} size="xs" />
                      </div>

                      {/* Priority */}
                      <div className="font-mono text-brand-muted" style={{ fontSize: 12 }}>
                        {rule.priority}
                      </div>

                      {/* Fires 7d */}
                      <div>
                        <FiresBar
                          fires={firesMap[rule.rule_id] ?? 0}
                          maxFires={maxFires}
                        />
                      </div>

                      {/* Active toggle */}
                      <div>
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className="font-mono transition-colors"
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: `1px solid ${rule.active ? "var(--good)" : "var(--rule)"}`,
                            background: rule.active ? "rgba(47,107,74,0.10)" : "transparent",
                            color: rule.active ? "var(--good)" : "var(--ink-muted)",
                          }}
                        >
                          {rule.active ? "Active" : "Inactive"}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openTest(rule)}
                          className="text-brand-muted hover:text-brand-accent transition-colors"
                          title="Test rule"
                        >
                          <FlaskConical size={13} />
                        </button>
                        <button
                          onClick={() => openEdit(rule)}
                          className="text-brand-muted hover:text-brand-accent transition-colors"
                          title="Edit rule"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.rule_id)}
                          className="text-brand-muted hover:text-brand-bad transition-colors"
                          title="Delete rule"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </DataTableShell>

      {/* ── Test modal ─────────────────────────────────────────────────── */}
      {testingRule && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg flex flex-col"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius)",
              boxShadow: "0 30px 60px -15px rgba(60,40,20,0.22)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-rule">
              <div>
                <p className="font-medium text-brand-ink" style={{ fontSize: 14 }}>Test Policy</p>
                <p className="font-mono text-brand-muted mt-0.5" style={{ fontSize: 11 }}>
                  {testingRule.rule_id} · {testingRule.action_type}
                </p>
              </div>
              <button onClick={() => setTestingRule(null)} className="text-brand-muted hover:text-brand-ink transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
                  Entity State (JSON)
                </label>
                <textarea
                  rows={4} value={testEntityState}
                  onChange={(e) => setTestEntityState(e.target.value)}
                  className={inputCls + " resize-y"}
                  style={{ borderRadius: "var(--radius-sm)" }}
                  placeholder='{"churn_risk": true, "ltv": 1500}'
                />
              </div>
              <div>
                <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>
                  Parameters (JSON)
                </label>
                <textarea
                  rows={3} value={testParameters}
                  onChange={(e) => setTestParameters(e.target.value)}
                  className={inputCls + " resize-y"}
                  style={{ borderRadius: "var(--radius-sm)" }}
                  placeholder='{"discount_pct": 20}'
                />
              </div>

              {testError && <p className="font-mono text-brand-bad" style={{ fontSize: 12 }}>{testError}</p>}

              {testResult && (
                <div
                  className="flex flex-col gap-2 p-4"
                  style={{ background: "var(--bg)", border: "1px solid var(--rule)", borderRadius: "var(--radius-sm)" }}
                >
                  <div className="flex items-center gap-3">
                    <StatusPill status={testResult.decision} />
                    {testResult.rule_id && (
                      <span className="font-mono text-brand-muted" style={{ fontSize: 11 }}>{testResult.rule_id}</span>
                    )}
                  </div>
                  <p className="font-mono text-brand-muted" style={{ fontSize: 12 }}>{testResult.reason}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-brand-rule flex gap-3">
              <button
                onClick={handleTest} disabled={testLoading}
                className="flex-1 py-2 font-mono font-medium bg-brand-ink text-brand-paper hover:bg-brand-accent-deep transition-colors disabled:opacity-40"
                style={{ fontSize: 13, borderRadius: "var(--radius-sm)" }}
              >
                {testLoading ? "Running…" : "Run simulation"}
              </button>
              <button
                onClick={() => setTestingRule(null)}
                className="px-4 py-2 font-mono text-brand-muted border border-brand-rule hover:text-brand-ink hover:border-brand-muted transition-colors"
                style={{ fontSize: 13, borderRadius: "var(--radius-sm)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-in editor ────────────────────────────────────────────── */}
      {panel && (
        <div className="fixed inset-y-0 right-0 w-[420px] shadow-2xl z-50 flex flex-col"
          style={{ background: "var(--paper)", borderLeft: "1px solid var(--rule)" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-rule">
            <div>
              <p className="font-medium text-brand-ink" style={{ fontSize: 14 }}>
                {panel.kind === "new" ? "New rule" : `Edit ${panel.ruleId}`}
              </p>
              <p className="font-mono text-brand-muted mt-0.5" style={{ fontSize: 11 }}>
                {panel.kind === "new" ? "Define conditions and outcome" : "Update rule configuration"}
              </p>
            </div>
            <button onClick={() => setPanel(null)} className="text-brand-muted hover:text-brand-ink transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
            <div>
              <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Rule ID</label>
              <input
                placeholder="e.g. churn_retention_v1"
                value={draft.rule_id}
                onChange={(e) => setDraft((d) => ({ ...d, rule_id: e.target.value }))}
                disabled={panel.kind === "edit"}
                className={inputCls + (panel.kind === "edit" ? " opacity-50 cursor-not-allowed" : "")}
                style={{ borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <div>
              <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Action type</label>
              <input
                placeholder="e.g. apply_discount"
                value={draft.action_type}
                onChange={(e) => setDraft((d) => ({ ...d, action_type: e.target.value }))}
                className={inputCls}
                style={{ borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <div>
              <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Description</label>
              <input
                placeholder="Optional description"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className={inputCls}
                style={{ borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Priority</label>
                <input
                  type="number" min={0} max={100}
                  value={draft.priority}
                  onChange={(e) => setDraft((d) => ({ ...d, priority: parseInt(e.target.value) || 0 }))}
                  className={inputCls}
                  style={{ borderRadius: "var(--radius-sm)" }}
                />
              </div>
              <div>
                <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Decision</label>
                <select
                  value={draft.decision}
                  onChange={(e) => setDraft((d) => ({ ...d, decision: e.target.value }))}
                  className={selectCls}
                  style={{ borderRadius: "var(--radius-sm)" }}
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="DENIED">DENIED</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-mono uppercase text-brand-muted block mb-2" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Conditions (JSON)</label>
              <textarea
                rows={8} value={draft.conditions}
                onChange={(e) => setDraft((d) => ({ ...d, conditions: e.target.value }))}
                className={inputCls + " resize-y"}
                style={{ borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox" checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                className="accent-brand-accent"
              />
              <span className="font-mono text-brand-muted" style={{ fontSize: 13 }}>Active</span>
            </label>
          </div>

          <div className="px-6 py-4 border-t border-brand-rule flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !draft.rule_id || !draft.action_type}
              className="flex-1 py-2 font-mono font-medium bg-brand-ink text-brand-paper hover:bg-brand-accent-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontSize: 13, borderRadius: "var(--radius-sm)" }}
            >
              {saving ? "Saving…" : panel.kind === "new" ? "Create rule" : "Save changes"}
            </button>
            <button
              onClick={() => setPanel(null)}
              className="px-4 py-2 font-mono text-brand-muted border border-brand-rule hover:text-brand-ink hover:border-brand-muted transition-colors"
              style={{ fontSize: 13, borderRadius: "var(--radius-sm)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

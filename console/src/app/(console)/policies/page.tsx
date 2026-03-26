"use client";

import { useState } from "react";
import { Plus, Shield, ChevronRight, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Condition {
  field: string;
  op: string;
  value: string;
}

interface Policy {
  name: string;
  version: string;
  action: string;
  priority: "critical" | "high" | "medium";
  active: boolean;
  conditions: Condition[];
  result: "APPROVED" | "DENIED" | "ESCALATED";
}

const INITIAL_POLICIES: Policy[] = [
  {
    name: "churn_retention_v1",
    version: "v1.0",
    action: "apply_discount",
    priority: "critical",
    active: true,
    conditions: [
      { field: "churn_risk", op: "=", value: '"HIGH"' },
      { field: "ltv", op: ">", value: "$500" },
      { field: "plan", op: "!=", value: '"free"' },
    ],
    result: "APPROVED",
  },
  {
    name: "refund_eligibility_v1",
    version: "v1.0",
    action: "issue_refund",
    priority: "high",
    active: true,
    conditions: [
      { field: "standing", op: "=", value: '"good"' },
      { field: "txn_age", op: "<", value: "30d" },
      { field: "last_refund", op: "=", value: "null" },
    ],
    result: "APPROVED",
  },
  {
    name: "vip_escalation_v1",
    version: "v1.0",
    action: "apply_discount",
    priority: "medium",
    active: true,
    conditions: [
      { field: "ltv", op: ">", value: "$5000" },
      { field: "churn_risk", op: "=", value: '"HIGH"' },
    ],
    result: "ESCALATED",
  },
];

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
  high:     "bg-orange-500/15 text-orange-400 border-orange-500/20",
  medium:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

const RESULT_STYLES: Record<string, string> = {
  APPROVED:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  DENIED:    "bg-red-500/15 text-red-400 border-red-500/20",
  ESCALATED: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

const BLANK_DRAFT: Omit<Policy, "version" | "active"> = {
  name: "",
  action: "",
  priority: "medium",
  conditions: [{ field: "", op: "=", value: "" }],
  result: "APPROVED",
};

const inputCls = "font-mono text-xs px-2 py-1.5 rounded border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40";

function ConditionRow({
  condition,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  condition: Condition;
  index: number;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#4a4a6a] text-xs w-7 text-right shrink-0 font-mono">
        {index === 0 ? "IF" : "AND"}
      </span>
      <input
        placeholder="field"
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value })}
        className={cn(inputCls, "w-24")}
      />
      <select
        value={condition.op}
        onChange={(e) => onChange({ ...condition, op: e.target.value })}
        className={cn(inputCls, "w-14 bg-[#0a0a14]")}
      >
        {["=", "!=", ">", "<", ">=", "<="].map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <input
        placeholder="value"
        value={condition.value}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        className={cn(inputCls, "flex-1 min-w-0")}
      />
      {canRemove && (
        <button onClick={onRemove} className="text-[#3a3a5a] hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function PolicyCard({ policy, onEdit }: { policy: Policy; onEdit: () => void }) {
  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-white/8 p-6 hover:border-white/12 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00ffc8]/10 flex items-center justify-center">
            <Shield size={15} className="text-[#00ffc8]" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-white">{policy.name}</h3>
            <p className="font-mono text-[11px] text-[#4a4a6a] mt-0.5">{policy.action}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide", PRIORITY_STYLES[policy.priority])}>
            {policy.priority}
          </span>
          <span className="text-[10px] font-mono text-[#4a4a6a] bg-white/4 border border-white/8 px-2 py-0.5 rounded">
            {policy.version}
          </span>
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", policy.active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-[#5a5a7a] border-white/8")}>
            {policy.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-[#0a0a14] rounded-lg p-4 font-mono text-xs space-y-1.5 border border-white/5">
        {policy.conditions.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[#3a3a5a] w-8 text-right shrink-0">{i === 0 ? "IF" : "AND"}</span>
            <span className="text-[#c4c4d4]">{c.field}</span>
            <span className="text-[#00ffc8]">{c.op}</span>
            <span className="text-[#00ffc8]/70">{c.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
          <span className="text-[#3a3a5a] w-8 text-right shrink-0">→</span>
          <span className={cn("font-semibold px-2 py-0.5 rounded text-[11px] border", RESULT_STYLES[policy.result])}>
            {policy.result}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-[#00ffc8] font-medium hover:text-[#00ffc8]/80 transition-colors"
        >
          Edit rule <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

type PanelMode = { kind: "edit"; policy: Policy } | { kind: "new" };

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [panel, setPanel] = useState<PanelMode | null>(null);
  const [draft, setDraft] = useState<Omit<Policy, "version" | "active">>(BLANK_DRAFT);

  function openNew() {
    setDraft(BLANK_DRAFT);
    setPanel({ kind: "new" });
  }

  function updateDraftCondition(i: number, c: Condition) {
    setDraft((d) => {
      const conds = [...d.conditions];
      conds[i] = c;
      return { ...d, conditions: conds };
    });
  }

  function addDraftCondition() {
    setDraft((d) => ({ ...d, conditions: [...d.conditions, { field: "", op: "=", value: "" }] }));
  }

  function removeDraftCondition(i: number) {
    setDraft((d) => ({ ...d, conditions: d.conditions.filter((_, idx) => idx !== i) }));
  }

  function saveNew() {
    if (!draft.name || !draft.action) return;
    const newPolicy: Policy = { ...draft, version: "v1.0", active: true };
    setPolicies((p) => [...p, newPolicy]);
    setPanel(null);
  }

  const editingPolicy = panel?.kind === "edit" ? panel.policy : null;
  const panelInputCls = "w-full font-mono text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40";
  const panelSelectCls = "w-full text-sm px-3 py-2 rounded-lg border border-white/8 bg-[#0a0a14] text-white focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40";

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Policies</h1>
          <p className="text-xs text-[#5a5a7a] mt-0.5">{policies.length} rules · {policies.filter(p => p.active).length} active</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
        >
          <Plus size={14} />
          New rule
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {policies.map((policy) => (
          <PolicyCard key={policy.name} policy={policy} onEdit={() => setPanel({ kind: "edit", policy })} />
        ))}
      </div>

      {/* Edit panel */}
      {editingPolicy && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-[#0d0d1a] border-l border-white/8 shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div>
              <p className="font-mono text-sm font-semibold text-white">{editingPolicy.name}</p>
              <p className="text-xs text-[#4a4a6a] mt-0.5">{editingPolicy.version}</p>
            </div>
            <button onClick={() => setPanel(null)} className="text-[#4a4a6a] hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Rule name</label>
              <input defaultValue={editingPolicy.name} className={panelInputCls} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Action type</label>
              <input defaultValue={editingPolicy.action} className={panelInputCls} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Conditions (DSL)</label>
              <div className="bg-[#0a0a14] rounded-lg p-4 font-mono text-xs space-y-2 border border-white/5">
                {editingPolicy.conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#3a3a5a] w-8 text-right shrink-0">{i === 0 ? "IF" : "AND"}</span>
                    <span className="text-[#c4c4d4]">{c.field}</span>
                    <span className="text-[#00ffc8]">{c.op}</span>
                    <span className="text-[#00ffc8]/70">{c.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-[#3a3a5a] w-8 text-right shrink-0">→</span>
                  <span className={cn("font-semibold px-2 py-0.5 rounded text-[11px] border", RESULT_STYLES[editingPolicy.result])}>
                    {editingPolicy.result}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-white/8 flex gap-3">
            <button className="flex-1 py-2 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors">
              Save changes
            </button>
            <button onClick={() => setPanel(null)} className="px-4 py-2 rounded-lg border border-white/8 text-[#6a6a8a] text-sm hover:text-white hover:border-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* New rule panel */}
      {panel?.kind === "new" && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-[#0d0d1a] border-l border-white/8 shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div>
              <p className="text-sm font-semibold text-white">New rule</p>
              <p className="text-xs text-[#4a4a6a] mt-0.5">Define conditions and outcome</p>
            </div>
            <button onClick={() => setPanel(null)} className="text-[#4a4a6a] hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Rule name</label>
              <input
                placeholder="e.g. win_back_discount_v1"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className={panelInputCls}
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Action type</label>
              <input
                placeholder="e.g. apply_discount"
                value={draft.action}
                onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value }))}
                className={panelInputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Priority</label>
                <select
                  value={draft.priority}
                  onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as Policy["priority"] }))}
                  className={panelSelectCls}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] block mb-2">Result</label>
                <select
                  value={draft.result}
                  onChange={(e) => setDraft((d) => ({ ...d, result: e.target.value as Policy["result"] }))}
                  className={panelSelectCls}
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="DENIED">DENIED</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a]">Conditions</label>
                <button
                  onClick={addDraftCondition}
                  className="text-[10px] text-[#00ffc8] font-medium hover:text-[#00ffc8]/80 flex items-center gap-1"
                >
                  <Plus size={10} /> Add condition
                </button>
              </div>
              <div className="space-y-2 bg-[#0a0a14] rounded-lg p-3 border border-white/5">
                {draft.conditions.map((c, i) => (
                  <ConditionRow
                    key={i}
                    condition={c}
                    index={i}
                    onChange={(updated) => updateDraftCondition(i, updated)}
                    onRemove={() => removeDraftCondition(i)}
                    canRemove={draft.conditions.length > 1}
                  />
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-1">
                  <span className="text-[#3a3a5a] text-xs w-7 text-right font-mono">→</span>
                  <span className={cn("font-mono font-semibold text-xs px-2 py-0.5 rounded border", RESULT_STYLES[draft.result])}>
                    {draft.result}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/8 flex gap-3">
            <button
              onClick={saveNew}
              disabled={!draft.name || !draft.action}
              className="flex-1 py-2 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create rule
            </button>
            <button
              onClick={() => setPanel(null)}
              className="px-4 py-2 rounded-lg border border-white/8 text-[#6a6a8a] text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

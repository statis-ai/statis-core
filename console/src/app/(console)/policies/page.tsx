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
  critical: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const RESULT_STYLES: Record<string, string> = {
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  DENIED: "bg-red-50 text-red-700 border-red-200",
  ESCALATED: "bg-violet-50 text-violet-700 border-violet-200",
};

const BLANK_DRAFT: Omit<Policy, "version" | "active"> = {
  name: "",
  action: "",
  priority: "medium",
  conditions: [{ field: "", op: "=", value: "" }],
  result: "APPROVED",
};

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
  const inputCls = "font-mono text-xs px-2 py-1.5 rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400 text-xs w-7 text-right shrink-0 font-mono">
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
        className={cn(inputCls, "w-14")}
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
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function PolicyCard({ policy, onEdit }: { policy: Policy; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Shield size={15} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-gray-900">{policy.name}</h3>
            <p className="font-mono text-[11px] text-gray-400 mt-0.5">{policy.action}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide", PRIORITY_STYLES[policy.priority])}>
            {policy.priority}
          </span>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
            {policy.version}
          </span>
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", policy.active ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200")}>
            {policy.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs space-y-1.5">
        {policy.conditions.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-gray-400 w-8 text-right shrink-0">{i === 0 ? "IF" : "AND"}</span>
            <span className="text-gray-700">{c.field}</span>
            <span className="text-indigo-500">{c.op}</span>
            <span className="text-indigo-700">{c.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
          <span className="text-gray-400 w-8 text-right shrink-0">→</span>
          <span className={cn("font-semibold px-2 py-0.5 rounded text-[11px] border", RESULT_STYLES[policy.result])}>
            {policy.result}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700"
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

  // Draft state for new rule
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
    const newPolicy: Policy = {
      ...draft,
      version: "v1.0",
      active: true,
    };
    setPolicies((p) => [...p, newPolicy]);
    setPanel(null);
  }

  const editingPolicy = panel?.kind === "edit" ? panel.policy : null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">Policies</h1>
          <p className="text-xs text-gray-400 mt-0.5">{policies.length} rules · {policies.filter(p => p.active).length} active</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} />
          New rule
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.name}
            policy={policy}
            onEdit={() => setPanel({ kind: "edit", policy })}
          />
        ))}
      </div>

      {/* Edit panel */}
      {editingPolicy && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="font-mono text-sm font-semibold text-gray-900">{editingPolicy.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{editingPolicy.version}</p>
            </div>
            <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Rule name</label>
              <input defaultValue={editingPolicy.name} className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Action type</label>
              <input defaultValue={editingPolicy.action} className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Conditions (DSL)</label>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs space-y-2 border border-gray-200">
                {editingPolicy.conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-400 w-8 text-right shrink-0">{i === 0 ? "IF" : "AND"}</span>
                    <span className="text-gray-700">{c.field}</span>
                    <span className="text-indigo-500">{c.op}</span>
                    <span className="text-indigo-700">{c.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-400 w-8 text-right shrink-0">→</span>
                  <span className="text-green-600 font-semibold">{editingPolicy.result}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Save changes
            </button>
            <button onClick={() => setPanel(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* New rule panel */}
      {panel?.kind === "new" && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">New rule</p>
              <p className="text-xs text-gray-400 mt-0.5">Define conditions and outcome</p>
            </div>
            <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            {/* Name */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Rule name</label>
              <input
                placeholder="e.g. win_back_discount_v1"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action type */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Action type</label>
              <input
                placeholder="e.g. apply_discount"
                value={draft.action}
                onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value }))}
                className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Priority + Result */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Priority</label>
                <select
                  value={draft.priority}
                  onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as Policy["priority"] }))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Result</label>
                <select
                  value={draft.result}
                  onChange={(e) => setDraft((d) => ({ ...d, result: e.target.value as Policy["result"] }))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="DENIED">DENIED</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Conditions</label>
                <button
                  onClick={addDraftCondition}
                  className="text-[10px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus size={10} /> Add condition
                </button>
              </div>
              <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
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
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-1">
                  <span className="text-gray-400 text-xs w-7 text-right font-mono">→</span>
                  <span className={cn("font-mono font-semibold text-xs px-2 py-0.5 rounded border", RESULT_STYLES[draft.result])}>
                    {draft.result}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={saveNew}
              disabled={!draft.name || !draft.action}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create rule
            </button>
            <button
              onClick={() => setPanel(null)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

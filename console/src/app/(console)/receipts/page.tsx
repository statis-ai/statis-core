"use client";

const RECEIPTS = [
  { id: "rct-8821", action_id: "act-0192", entity: "acct-42", rule: "churn_retention_v1 v1.0", decision: "APPROVED", hash: "3f8a9d2c1a8b4e7f", executed_at: "2026-03-04T14:32:08Z" },
  { id: "rct-8822", action_id: "act-0191", entity: "cust-771", rule: "refund_eligibility_v1 v1.0", decision: "APPROVED", hash: "a1b2c3d4e5f67890", executed_at: "2026-03-04T14:28:12Z" },
  { id: "rct-8823", action_id: "act-0189", entity: "tenant-9", rule: "auto_provision_v1 v1.0", decision: "APPROVED", hash: "7f3e1c9a2b4d5e6f", executed_at: "2026-03-04T14:18:06Z" },
];

const DECISION_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  DENIED: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function ReceiptsPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Receipts</h1>
        <p className="text-xs text-[#5a5a7a] mt-0.5">{RECEIPTS.length} tamper-evident receipts</p>
      </div>

      <div className="bg-[#0d0d1a] rounded-xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0a0a14] border-b border-white/8">
            <tr className="text-[10px] uppercase tracking-widest text-[#5a5a7a]">
              <th className="text-left px-5 py-3 font-semibold">Receipt ID</th>
              <th className="text-left px-5 py-3 font-semibold">Action ID</th>
              <th className="text-left px-5 py-3 font-semibold">Entity</th>
              <th className="text-left px-5 py-3 font-semibold">Rule</th>
              <th className="text-left px-5 py-3 font-semibold">Decision</th>
              <th className="text-left px-5 py-3 font-semibold">Hash</th>
              <th className="text-left px-5 py-3 font-semibold">Executed at</th>
            </tr>
          </thead>
          <tbody>
            {RECEIPTS.map((r) => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-[#00ffc8] font-semibold">{r.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#8a8a9a]">{r.action_id}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#c4c4d4]">{r.entity}</td>
                <td className="px-5 py-3 font-mono text-[11px] text-[#6a6a8a]">{r.rule}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DECISION_STYLES[r.decision] ?? ""}`}>
                    {r.decision}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-[11px] text-[#5a5a7a]">sha256:{r.hash}…</td>
                <td className="px-5 py-3 text-[11px] text-[#5a5a7a]">
                  {new Date(r.executed_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

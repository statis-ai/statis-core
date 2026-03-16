"use client";

const RECEIPTS = [
  { id: "rct-8821", action_id: "act-0192", entity: "acct-42", rule: "churn_retention_v1 v1.0", decision: "APPROVED", hash: "3f8a9d2c1a8b4e7f", executed_at: "2026-03-04T14:32:08Z" },
  { id: "rct-8822", action_id: "act-0191", entity: "cust-771", rule: "refund_eligibility_v1 v1.0", decision: "APPROVED", hash: "a1b2c3d4e5f67890", executed_at: "2026-03-04T14:28:12Z" },
  { id: "rct-8823", action_id: "act-0189", entity: "tenant-9", rule: "auto_provision_v1 v1.0", decision: "APPROVED", hash: "7f3e1c9a2b4d5e6f", executed_at: "2026-03-04T14:18:06Z" },
];

const DECISION_STYLES: Record<string, string> = {
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  DENIED: "bg-red-50 text-red-700 border-red-200",
};

export default function ReceiptsPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-gray-900">Receipts</h1>
        <p className="text-xs text-gray-400 mt-0.5">{RECEIPTS.length} tamper-evident receipts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[10px] uppercase tracking-widest text-gray-400">
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
            {RECEIPTS.map((r, i) => (
              <tr key={r.id} className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                <td className="px-5 py-3 font-mono text-xs text-indigo-600 font-semibold">{r.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{r.action_id}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-700">{r.entity}</td>
                <td className="px-5 py-3 font-mono text-[11px] text-gray-500">{r.rule}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DECISION_STYLES[r.decision] ?? ""}`}>
                    {r.decision}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-[11px] text-gray-400">{r.hash}</td>
                <td className="px-5 py-3 text-[11px] text-gray-400">
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

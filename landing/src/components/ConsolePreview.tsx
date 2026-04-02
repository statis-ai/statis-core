const SIDEBAR_ITEMS = [
  { group: null, items: [{ name: "Home", active: true }] },
  { group: "OBSERVE", items: [
    { name: "Actions", active: false },
    { name: "Receipts", active: false },
    { name: "Entities", active: false },
  ]},
  { group: "GOVERN", items: [
    { name: "Policies", active: false },
    { name: "Escalations", badge: "2", active: false },
  ]},
  { group: "CONNECT", items: [
    { name: "Adapters", active: false },
    { name: "Webhooks", active: false },
  ]},
];

const METRICS = [
  { label: "Actions Today",    value: "148",   sub: "+12 vs yesterday" },
  { label: "Execution Rate",   value: "99.3%", sub: "of committed" },
  { label: "Escalations",      value: "2",     sub: "awaiting review" },
  { label: "Receipts Minted",  value: "1,204", sub: "all time" },
];

const ACTIONS = [
  { id: "act-f93a", entity: "acct-8821", action: "apply_discount",  status: "COMPLETED",  rule: "churn_retention_v1", time: "2s ago" },
  { id: "act-e41b", entity: "acct-3304", action: "send_invoice",    status: "COMPLETED",  rule: "billing_gate_v2",    time: "14s ago" },
  { id: "act-d28c", entity: "acct-1190", action: "update_plan",     status: "ESCALATED",  rule: "plan_change_v1",     time: "1m ago" },
  { id: "act-c77d", entity: "acct-5512", action: "refund_charge",   status: "DENIED",     rule: "refund_limit_v1",    time: "3m ago" },
  { id: "act-b19e", entity: "acct-9920", action: "apply_discount",  status: "COMPLETED",  rule: "churn_retention_v1", time: "5m ago" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  COMPLETED: { color: "#ffffff", bg: "rgba(255,255,255,0.06)" },
  ESCALATED: { color: "#888888", bg: "rgba(255,255,255,0.04)" },
  DENIED:    { color: "#555555", bg: "rgba(255,255,255,0.03)" },
};

export function ConsolePreview() {
  return (
    <section
      className="py-28"
      style={{}}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
          style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
        >
          Console
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-12">
          See everything. Control everything.
        </h2>

        {/* Console render */}
        <div
          className="rounded overflow-hidden text-left"
          style={{
            background: "#0e0e0e",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex">
            {/* Sidebar */}
            <div
              className="hidden md:block shrink-0 py-4 px-3"
              style={{ width: "180px", borderRight: "1px solid var(--border)", background: "#0a0a0a" }}
            >
              <div className="flex items-center gap-2 px-2 mb-5">
                <span className="text-xs font-bold text-white">statis</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#333", color: "#aaa" }}>
                  console
                </span>
              </div>

              {SIDEBAR_ITEMS.map((section, si) => (
                <div key={si} className="mb-3">
                  {section.group && (
                    <p className="text-[8px] uppercase tracking-[0.2em] px-2 mb-1.5" style={{ color: "#333" }}>
                      {section.group}
                    </p>
                  )}
                  {section.items.map(item => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-2 py-1.5 rounded text-[10px]"
                      style={{
                        background: item.active ? "rgba(255,255,255,0.06)" : "transparent",
                        color: item.active ? "#ffffff" : "#555",
                      }}
                    >
                      <span>{item.name}</span>
                      {"badge" in item && item.badge && (
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#888" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 min-h-[400px]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Home</h3>
                  <p className="text-[9px]" style={{ color: "#444" }}>Last updated 30 seconds ago</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                {METRICS.map(m => (
                  <div
                    key={m.label}
                    className="rounded p-3"
                    style={{ background: "#111", border: "1px solid var(--border)" }}
                  >
                    <p className="text-[8px] uppercase tracking-wider mb-1" style={{ color: "#555" }}>
                      {m.label}
                    </p>
                    <p className="text-lg font-bold text-white">{m.value}</p>
                    <p className="text-[8px]" style={{ color: "#333" }}>{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Actions table */}
              <div className="rounded overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="px-3 py-2" style={{ background: "#111", borderBottom: "1px solid var(--border)" }}>
                  <p className="text-[9px] font-bold" style={{ color: "#555" }}>Recent Actions</p>
                </div>
                <table className="w-full text-[9px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "#333" }}>
                      <th className="text-left px-3 py-2 font-normal">ID</th>
                      <th className="text-left px-3 py-2 font-normal">Entity</th>
                      <th className="text-left px-3 py-2 font-normal">Action</th>
                      <th className="text-left px-3 py-2 font-normal">Status</th>
                      <th className="text-left px-3 py-2 font-normal hidden lg:table-cell">Rule</th>
                      <th className="text-right px-3 py-2 font-normal">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ACTIONS.map(a => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #151515" }}>
                        <td className="px-3 py-2 text-white">{a.id}</td>
                        <td className="px-3 py-2" style={{ color: "#555" }}>{a.entity}</td>
                        <td className="px-3 py-2" style={{ color: "#888" }}>{a.action}</td>
                        <td className="px-3 py-2">
                          <span
                            className="text-[8px] px-1.5 py-0.5 rounded"
                            style={STATUS_STYLE[a.status]}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 hidden lg:table-cell" style={{ color: "#333" }}>{a.rule}</td>
                        <td className="px-3 py-2 text-right" style={{ color: "#333" }}>{a.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

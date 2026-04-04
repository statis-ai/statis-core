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
  { label: "Actions Today",    value: "12,847",  sub: "+1,203 vs yesterday" },
  { label: "Execution Rate",   value: "99.97%",  sub: "of committed" },
  { label: "Escalations",      value: "3",       sub: "awaiting review" },
  { label: "Receipts Minted",  value: "1.28M",   sub: "all time" },
];

const ACTIONS = [
  { id: "act-f93a", entity: "svc-landing", action: "deploy_landing_page", status: "COMPLETED", rule: "infra_deploy_v1",   time: "4s ago" },
  { id: "act-e41b", entity: "svc-api",     action: "run_test_suite",      status: "COMPLETED", rule: "ci_gate_v1",        time: "12s ago" },
  { id: "act-d28c", entity: "svc-infra",   action: "update_dns_record",   status: "ESCALATED", rule: "infra_change_v2",   time: "1m ago" },
  { id: "act-c77d", entity: "svc-comms",   action: "send_slack_alert",    status: "COMPLETED", rule: "comms_policy_v1",   time: "3m ago" },
  { id: "act-b19e", entity: "svc-api",     action: "scale_api_workers",   status: "COMPLETED", rule: "infra_deploy_v1",   time: "7m ago" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  COMPLETED: { color: "#c85c1a", bg: "rgba(200,92,26,0.08)", border: "rgba(200,92,26,0.2)" },
  ESCALATED: { color: "#888888", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  DENIED:    { color: "#444444", bg: "transparent", border: "rgba(255,255,255,0.05)" },
};

export function ConsolePreview() {
  return (
    <section className="py-20">
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

        {/* Console window */}
        <div
          className="rounded-lg overflow-hidden text-left"
          style={{
            background: "#0c0c0c",
            border: "1px solid #252525",
            borderTop: "1px solid rgba(200,92,26,0.35)",
            boxShadow: [
              "0 0 0 1px rgba(0,0,0,0.5)",
              "0 32px 80px rgba(0,0,0,0.7)",
              "0 8px 32px rgba(0,0,0,0.5)",
              "0 0 80px rgba(200,92,26,0.04)",
            ].join(", "),
          }}
        >
          {/* Window chrome bar */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: "#111111",
              borderBottom: "1px solid #1e1e1e",
            }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#2a2a2a" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#2a2a2a" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#2a2a2a" }} />
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className="text-[10px] px-3 py-0.5 rounded"
                style={{
                  color: "#444",
                  background: "#0e0e0e",
                  border: "1px solid #1e1e1e",
                  letterSpacing: "0.05em",
                }}
              >
                console.statis.dev
              </div>
            </div>
            <div className="w-12" /> {/* spacer */}
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div
              className="hidden md:flex flex-col shrink-0 py-4"
              style={{ width: "176px", borderRight: "1px solid #1a1a1a", background: "#0a0a0a" }}
            >
              <div className="flex items-center gap-2 px-4 mb-6">
                <span className="text-xs font-bold text-white tracking-tight">statis</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: "#1e1e1e", color: "#555", border: "1px solid #252525" }}
                >
                  console
                </span>
              </div>

              {SIDEBAR_ITEMS.map((section, si) => (
                <div key={si} className="mb-4 px-2">
                  {section.group && (
                    <p className="text-[8px] uppercase tracking-[0.2em] px-2 mb-2" style={{ color: "#2e2e2e" }}>
                      {section.group}
                    </p>
                  )}
                  {section.items.map(item => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-2 py-1.5 rounded text-[11px] mb-0.5"
                      style={{
                        background: item.active ? "rgba(200,92,26,0.08)" : "transparent",
                        color: item.active ? "#c85c1a" : "#3a3a3a",
                        borderLeft: item.active ? "2px solid rgba(200,92,26,0.5)" : "2px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{item.name}</span>
                      {"badge" in item && item.badge && (
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(200,92,26,0.12)", color: "#c85c1a", border: "1px solid rgba(200,92,26,0.2)" }}
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
            <div className="flex-1 p-5 min-h-[420px]" style={{ background: "#0c0c0c" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Home</h3>
                  <p className="text-[9px] mt-0.5" style={{ color: "#333" }}>Last updated 30 seconds ago</p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded"
                  style={{ background: "rgba(200,92,26,0.06)", border: "1px solid rgba(200,92,26,0.15)", color: "#c85c1a" }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c85c1a", display: "inline-block" }} />
                  Live
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                {METRICS.map((m, i) => (
                  <div
                    key={m.label}
                    className="rounded-md p-3"
                    style={{
                      background: "#0e0e0e",
                      border: "1px solid #1e1e1e",
                      boxShadow: i === 1 ? "0 0 0 1px rgba(200,92,26,0.08) inset" : "none",
                    }}
                  >
                    <p className="text-[8px] uppercase tracking-wider mb-1.5" style={{ color: "#3a3a3a" }}>
                      {m.label}
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: i === 1 ? "#c85c1a" : "#ffffff" }}
                    >
                      {m.value}
                    </p>
                    <p className="text-[8px] mt-1" style={{ color: "#2e2e2e" }}>{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Actions table */}
              <div
                className="rounded-md overflow-hidden"
                style={{ border: "1px solid #1e1e1e" }}
              >
                <div
                  className="px-3 py-2.5 flex items-center justify-between"
                  style={{ background: "#0e0e0e", borderBottom: "1px solid #1a1a1a" }}
                >
                  <p className="text-[9px] font-bold" style={{ color: "#3a3a3a" }}>Recent Actions</p>
                  <p className="text-[8px]" style={{ color: "#2a2a2a" }}>↻ auto-refresh</p>
                </div>
                <table className="w-full text-[9px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                      {["ID", "Service", "Action", "Status", "Policy", "Time"].map((h, i) => (
                        <th
                          key={h}
                          className={`py-2 font-normal ${i === 5 ? "text-right px-3" : "text-left px-3"} ${i === 4 ? "hidden lg:table-cell" : ""}`}
                          style={{ color: "#2e2e2e" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ACTIONS.map((a, idx) => (
                      <tr
                        key={a.id}
                        style={{
                          borderBottom: idx < ACTIONS.length - 1 ? "1px solid #131313" : "none",
                          background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.005)",
                        }}
                      >
                        <td className="px-3 py-2.5" style={{ color: "#555" }}>{a.id}</td>
                        <td className="px-3 py-2.5" style={{ color: "#333" }}>{a.entity}</td>
                        <td className="px-3 py-2.5" style={{ color: "#4a4a4a" }}>{a.action}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className="text-[8px] px-2 py-0.5 rounded"
                            style={{
                              color: STATUS_STYLE[a.status].color,
                              background: STATUS_STYLE[a.status].bg,
                              border: `1px solid ${STATUS_STYLE[a.status].border}`,
                            }}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell" style={{ color: "#282828" }}>{a.rule}</td>
                        <td className="px-3 py-2.5 text-right" style={{ color: "#2e2e2e" }}>{a.time}</td>
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

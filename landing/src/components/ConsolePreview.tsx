const SIDEBAR_ITEMS = [
  { group: null, items: [
    { name: "Home", active: true },
    { name: "Inbox", badge: "4", active: false },
  ]},
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

type ActionStatus = "COMPLETED" | "ESCALATED" | "DENIED";

const ACTIONS: Array<{
  id: string;
  entity: string;
  entityColor: string;
  action: string;
  status: ActionStatus;
  rule: string;
  time: string;
  selected?: boolean;
}> = [
  { id: "act-f93a", entity: "svc-landing", entityColor: "#A78BFA", action: "deploy_landing_page", status: "COMPLETED", rule: "infra_deploy_v1",   time: "4s ago" },
  { id: "act-e41b", entity: "svc-api",     entityColor: "#34D399", action: "run_test_suite",      status: "COMPLETED", rule: "ci_gate_v1",        time: "12s ago" },
  { id: "act-d28c", entity: "svc-infra",   entityColor: "#FACC15", action: "update_dns_record",   status: "ESCALATED", rule: "infra_change_v2",   time: "1m ago", selected: true },
  { id: "act-c77d", entity: "svc-comms",   entityColor: "#60A5FA", action: "send_slack_alert",    status: "COMPLETED", rule: "comms_policy_v1",   time: "3m ago" },
  { id: "act-b19e", entity: "svc-api",     entityColor: "#34D399", action: "scale_api_workers",   status: "COMPLETED", rule: "infra_deploy_v1",   time: "7m ago" },
];

const STATUS_STYLE: Record<ActionStatus, { color: string; bg: string; border: string }> = {
  COMPLETED: { color: "#FB923C",  bg: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.25)" },
  ESCALATED: { color: "#FACC15",  bg: "rgba(250,204,21,0.10)",  border: "rgba(250,204,21,0.25)" },
  DENIED:    { color: "#F87171",  bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.22)" },
};

const FILTERS = [
  { name: "All",        count: "12,847", active: true },
  { name: "Completed",  count: "12,802", active: false },
  { name: "Escalated",  count: "3",      active: false },
  { name: "Denied",     count: "42",     active: false },
];

function StackLogoMini() {
  return (
    <svg width="22" height="22" viewBox="-15 -15 130 130" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="csConsoleStackGrad" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB585" />
          <stop offset="100%" stopColor="#A04211" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 71 71)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#3A1808" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke="#0B0B0E" strokeWidth="3" />
      </g>
      <g transform="rotate(45 64 64)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#5A2208" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke="#0B0B0E" strokeWidth="3" />
      </g>
      <g transform="rotate(45 57 57)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#8A380F" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke="#0B0B0E" strokeWidth="3" />
      </g>
      <g transform="rotate(45 50 50)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="url(#csConsoleStackGrad)" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke="#0B0B0E" strokeWidth="3" />
      </g>
      <g transform="rotate(45 50 50)">
        <rect x="36" y="36" width="28" height="28" rx="6" fill="#FFE4D0" opacity="0.92" />
      </g>
    </svg>
  );
}

export function ConsolePreview() {
  return (
    <section
      className="relative pt-24 pb-44 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0A0806 0%, #0A0806 30%, #14100A 50%, #2A1F12 70%, #5C4628 85%, #A88654 95%, #D4B888 100%)",
      }}
    >
      {/* Soft horizon glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 pointer-events-none"
        style={{
          bottom: 0,
          height: "260px",
          background:
            "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(232,196,140,0.25) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-4 inline-block px-2.5 py-1 rounded"
          style={{ color: "#A1A1AA", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          Console
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 text-white tracking-tight">
          See everything. Control everything.
        </h2>
        <p className="text-sm mb-16 max-w-xl mx-auto" style={{ color: "#A1A1AA" }}>
          Every agent action observable, every policy decision auditable, every connector under one roof.
        </p>

        {/* 3D pedestal wrapper */}
        <div style={{ perspective: "2400px", perspectiveOrigin: "50% 30%" }}>
          {/* Console window */}
          <div
            className="rounded-2xl overflow-hidden text-left mx-auto"
            style={{
              background: "#0F0F12",
              border: "1px solid rgba(255,255,255,0.08)",
              transform: "rotateX(3deg)",
              transformOrigin: "50% 100%",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.08)",
                "0 0 0 1px rgba(0,0,0,0.5)",
                "0 80px 160px rgba(0,0,0,0.65)",
                "0 30px 60px rgba(0,0,0,0.5)",
                "0 6px 16px rgba(0,0,0,0.6)",
                "0 60px 120px rgba(212,184,136,0.10)",
              ].join(", "),
            }}
          >
            {/* Window chrome bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: "#15151A",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#3F3F46" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#3F3F46" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#3F3F46" }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div
                  className="text-[11px] px-3 py-1 rounded-md"
                  style={{
                    color: "#A1A1AA",
                    background: "#0B0B0E",
                    border: "1px solid rgba(255,255,255,0.06)",
                    letterSpacing: "0.04em",
                  }}
                >
                  console.statis.dev
                </div>
              </div>
              <div className="w-12" /> {/* spacer */}
            </div>

            <div className="flex">
              {/* ─────── SIDEBAR ─────── */}
              <div
                className="hidden md:flex flex-col shrink-0 py-5"
                style={{ width: "200px", borderRight: "1px solid rgba(255,255,255,0.06)", background: "#0B0B0E" }}
              >
                {/* Logo + wordmark — matches navbar */}
                <div className="flex items-center gap-2 px-5 mb-7">
                  <StackLogoMini />
                  <span className="text-[15px] font-bold text-white tracking-tight leading-none">statis</span>
                </div>

                {SIDEBAR_ITEMS.map((section, si) => (
                  <div key={si} className="mb-5 px-2.5">
                    {section.group && (
                      <p className="text-[9px] uppercase tracking-[0.18em] px-2.5 mb-2 font-semibold" style={{ color: "#52525B" }}>
                        {section.group}
                      </p>
                    )}
                    {section.items.map(item => (
                      <div
                        key={item.name}
                        className="cs-sidebar-item flex items-center justify-between px-2.5 py-1.5 rounded-md text-[12px] mb-0.5 cursor-pointer transition-colors"
                        data-active={item.active || undefined}
                      >
                        <span>{item.name}</span>
                        {"badge" in item && item.badge && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                            style={
                              item.name === "Escalations"
                                ? { background: "rgba(251,146,60,0.15)", color: "#FB923C", border: "1px solid rgba(251,146,60,0.25)" }
                                : { background: "rgba(255,255,255,0.06)", color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.08)" }
                            }
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex-1" />

                {/* User row at the bottom */}
                <div className="px-3 mt-4">
                  <div className="cs-sidebar-item flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #FB923C, #c85c1a)" }}>
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white truncate leading-tight">Aniket Kumar</p>
                      <p className="text-[9px] truncate leading-tight" style={{ color: "#52525B" }}>statis.dev</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────── MAIN CONTENT ─────── */}
              <div className="flex-1 min-h-[480px] flex flex-col" style={{ background: "#0F0F12" }}>
                {/* Page header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-bold text-white tracking-tight">Home</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "#71717A", border: "1px solid rgba(255,255,255,0.06)" }}>
                      Last 24h
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="cs-search hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md cursor-pointer transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <span className="text-[10px]" style={{ color: "#71717A" }}>Search actions…</span>
                      <span className="text-[9px] px-1 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "#71717A" }}>⌘K</span>
                    </div>
                    {/* Live badge */}
                    <div
                      className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded font-semibold"
                      style={{ background: "rgba(251,146,60,0.10)", border: "1px solid rgba(251,146,60,0.25)", color: "#FB923C" }}
                    >
                      <span className="cs-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#FB923C", display: "inline-block" }} />
                      Live
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 p-6">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
                    {METRICS.map((m, i) => (
                      <div
                        key={m.label}
                        className="cs-metric rounded-lg p-3.5 cursor-pointer transition-colors"
                        style={{
                          background: "#15151A",
                          border: "1px solid rgba(255,255,255,0.06)",
                          boxShadow: i === 1 ? "inset 0 0 0 1px rgba(251,146,60,0.18)" : "none",
                        }}
                      >
                        <p className="text-[9px] uppercase tracking-[0.12em] mb-1.5 font-semibold" style={{ color: "#71717A" }}>
                          {m.label}
                        </p>
                        <p
                          className="text-xl font-bold tracking-tight"
                          style={{ color: i === 1 ? "#FB923C" : "#FFFFFF" }}
                        >
                          {m.value}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: "#52525B" }}>{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {FILTERS.map(f => (
                      <button
                        key={f.name}
                        className="cs-filter text-[10px] px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                        data-active={f.active || undefined}
                      >
                        {f.name}
                        <span className="cs-filter-count text-[9px]">{f.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Actions table */}
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="px-4 py-2.5 flex items-center justify-between"
                      style={{ background: "#15151A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: "#A1A1AA" }}>Recent Actions</p>
                      <p className="text-[10px]" style={{ color: "#52525B" }}>↻ auto-refresh</p>
                    </div>
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {["ID", "Service", "Action", "Status", "Policy", "Time"].map((h, i) => (
                            <th
                              key={h}
                              className={`py-2.5 font-semibold ${i === 5 ? "text-right px-3" : "text-left px-3"} ${i === 4 ? "hidden lg:table-cell" : ""}`}
                              style={{ color: "#71717A", letterSpacing: "0.06em" }}
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
                            className="cs-row cursor-pointer transition-colors"
                            data-selected={a.selected || undefined}
                            style={{
                              borderBottom: idx < ACTIONS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            }}
                          >
                            <td className="px-3 py-2.5 font-mono" style={{ color: "#A1A1AA" }}>{a.id}</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-sm" style={{ background: a.entityColor }} />
                                <span style={{ color: "#E4E4E7" }}>{a.entity}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: "#FFFFFF" }}>{a.action}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded font-bold"
                                style={{
                                  color: STATUS_STYLE[a.status].color,
                                  background: STATUS_STYLE[a.status].bg,
                                  border: `1px solid ${STATUS_STYLE[a.status].border}`,
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLE[a.status].color }} />
                                {a.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 hidden lg:table-cell font-mono" style={{ color: "#71717A" }}>{a.rule}</td>
                            <td className="px-3 py-2.5 text-right" style={{ color: "#71717A" }}>{a.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Console hover/active state styles (scoped via class names) */}
      <style>{`
        .cs-sidebar-item {
          color: #A1A1AA;
        }
        .cs-sidebar-item:hover {
          background: rgba(255,255,255,0.04);
          color: #FFFFFF;
        }
        .cs-sidebar-item[data-active] {
          background: rgba(251,146,60,0.10);
          color: #FB923C;
          font-weight: 600;
          box-shadow: inset 2px 0 0 #FB923C;
        }
        .cs-metric:hover {
          background: #1A1A20 !important;
          border-color: rgba(255,255,255,0.10) !important;
        }
        .cs-search:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.10) !important;
        }
        .cs-row:hover {
          background: rgba(255,255,255,0.03);
        }
        .cs-row[data-selected] {
          background: rgba(251,146,60,0.06);
          box-shadow: inset 2px 0 0 #FB923C;
        }
        .cs-row[data-selected]:hover {
          background: rgba(251,146,60,0.09);
        }
        .cs-filter {
          color: #A1A1AA;
          background: transparent;
          border: 1px solid transparent;
        }
        .cs-filter:hover {
          background: rgba(255,255,255,0.05);
          color: #E4E4E7;
        }
        .cs-filter[data-active] {
          background: rgba(255,255,255,0.06);
          color: #FFFFFF;
          border-color: rgba(255,255,255,0.10);
        }
        .cs-filter-count {
          color: #52525B;
          font-weight: 500;
        }
        .cs-filter[data-active] .cs-filter-count {
          color: #A1A1AA;
        }
        .cs-pulse {
          animation: cs-pulse 1.6s ease-in-out infinite;
        }
        @keyframes cs-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,146,60,0.6); }
          50% { box-shadow: 0 0 0 4px rgba(251,146,60,0); }
        }
      `}</style>
    </section>
  );
}

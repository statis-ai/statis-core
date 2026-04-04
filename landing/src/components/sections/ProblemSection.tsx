const ERROR_LINES = [
  { ts: "09:23:11.204", key: "action_id",    val: "act-7f3a1c",       dim: false },
  { ts: "09:23:11.206", key: "adapter",      val: "stripe.charge",    dim: false },
  { ts: "09:23:11.207", key: "amount",       val: "$299.00",          dim: false },
  { ts: "09:23:11.441", key: "executions",   val: "2  ← fired twice", warn: true },
  { ts: "09:23:11.442", key: "receipt",      val: "none",             muted: true },
  { ts: "09:23:11.442", key: "audit_trail",  val: "none",             muted: true },
  { ts: "09:23:11.443", key: "status",       val: "UNKNOWN",          muted: true },
];

export function ProblemSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left: the error log */}
          <div>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: "#0c0c0c",
                border: "1px solid #222",
                borderTop: "1px solid rgba(180,40,40,0.4)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 60px rgba(180,40,40,0.03)",
              }}
            >
              {/* Chrome */}
              <div
                className="flex items-center gap-3 px-4 py-2.5"
                style={{ background: "#111", borderBottom: "1px solid #1a1a1a" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#4a1a1a" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2e2a1a" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1e1e1e" }} />
                </div>
                <span className="text-[9px] flex-1 text-center" style={{ color: "#333" }}>agent.log — prod-worker-3</span>
                <span
                  className="text-[8px] px-2 py-0.5 rounded"
                  style={{ background: "rgba(180,40,40,0.1)", color: "#aa4040", border: "1px solid rgba(180,40,40,0.2)" }}
                >
                  ERROR
                </span>
              </div>

              {/* Shell prompt */}
              <div className="px-4 pt-3 pb-2 font-mono text-[10px]" style={{ borderBottom: "1px solid #111" }}>
                <span style={{ color: "#3a3a3a" }}>prod-worker-3@statis:~$ </span>
                <span style={{ color: "#444" }}>tail -f agent.log</span>
              </div>

              <div className="px-4 py-4 font-mono text-[11px] leading-[1.9]">
                {ERROR_LINES.map(({ ts, key, val, warn, muted }) => (
                  <div key={key} className="flex gap-3">
                    <span style={{ color: "#1e1e1e", shrink: 0 }}>[{ts}]</span>
                    <span style={{ color: "#2e2e2e", minWidth: "88px" }}>{key}</span>
                    <span style={{
                      color: warn ? "#aa4040" : muted ? "#2e2e2e" : "#555",
                      fontWeight: warn ? 600 : 400,
                    }}>
                      {val}
                    </span>
                  </div>
                ))}

                <div className="mt-4 pt-3" style={{ borderTop: "1px solid #151515" }}>
                  <span style={{ color: "#252525" }}>[09:23:12.001] </span>
                  <span style={{ color: "#aa4040" }}>WARN </span>
                  <span style={{ color: "#252525" }}>customer support ticket #4821 opened</span>
                </div>
                <div className="mt-2">
                  <span style={{ color: "#aa4040" }}>prod-worker-3@statis:~$ </span>
                  <span className="terminal-cursor" style={{ display: "inline-block", width: "7px", height: "12px", background: "#aa4040", verticalAlign: "middle", opacity: 0.8 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
              style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
            >
              The problem
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
              Agents in production<br />
              need a guardrail layer.
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-2)" }}>
              Your agent just charged a customer twice. There&rsquo;s no receipt,
              no audit trail, no way to know which policies ran or why.
              You find out when support calls.
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-2)" }}>
              Every AI agent that touches production systems — billing, CRM,
              communication, data — needs policy evaluation before it acts and
              a tamper-evident record of what happened after.
            </p>

            <div className="space-y-3">
              {[
                { problem: "Agent retries charge customer twice", fix: "Exactly-once execution lock" },
                { problem: "No visibility into what ran or why", fix: "SHA-256 receipt on every action" },
                { problem: "No way to stop a rogue action mid-flight", fix: "Policy engine evaluates before execution" },
              ].map(({ problem, fix }) => (
                <div key={problem} className="flex gap-4 text-xs">
                  <div className="flex-1" style={{ color: "#444" }}>
                    <span style={{ color: "#333" }}>✗</span> {problem}
                  </div>
                  <div className="flex-1" style={{ color: "var(--orange)" }}>
                    <span>✓</span> {fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Dogfood() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div
          className="rounded-lg px-8 py-10 text-center"
          style={{
            background: "linear-gradient(135deg, #0e0e0e 0%, #111111 100%)",
            border: "1px solid #222",
            borderTop: "1px solid rgba(200,92,26,0.2)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 40px rgba(200,92,26,0.02)",
          }}
        >
          {/* Receipt decoration */}
          <div className="flex justify-center mb-6">
            <div
              className="text-[9px] font-mono px-4 py-2.5 rounded text-left"
              style={{
                background: "#0a0a0a",
                border: "1px solid #1e1e1e",
                color: "#333",
                lineHeight: "1.8",
              }}
            >
              <div><span style={{ color: "#2a2a2a" }}>receipt_id</span>  <span style={{ color: "#444" }}>sha256:a3f29c...</span></div>
              <div><span style={{ color: "#2a2a2a" }}>action    </span>  <span style={{ color: "var(--orange)" }}>deploy_landing_page</span></div>
              <div><span style={{ color: "#2a2a2a" }}>status    </span>  <span style={{ color: "#555" }}>COMPLETED</span></div>
              <div><span style={{ color: "#2a2a2a" }}>policy    </span>  <span style={{ color: "#333" }}>infra_deploy_v1</span></div>
            </div>
          </div>

          <p
            className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
            style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
          >
            Dogfood
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "var(--text)" }}>
            We used Statis to build Statis.
          </h2>
          <p
            className="mt-4 text-sm leading-relaxed max-w-xl mx-auto"
            style={{ color: "var(--text-2)" }}
          >
            Every action proposal, policy check, and execution receipt on this site
            ran through our own infrastructure.
          </p>
        </div>
      </div>
    </section>
  );
}

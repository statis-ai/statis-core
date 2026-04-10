import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const BADGES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "SOC 2 Type II",
    sub: "Audit in progress. Security controls across access, availability, and confidentiality.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "OIDC SSO",
    sub: "Native Okta, Entra ID, and any OIDC-compliant provider. SCIM provisioning included.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Self-hostable",
    sub: "Deploy on your own infrastructure with Docker Compose. No data leaves your VPC.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Tamper-evident Receipts",
    sub: "Every action produces a SHA-256 signed receipt. Immutable. Auditable. Cryptographically verifiable.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Data Residency",
    sub: "Choose your region. On-prem deployment available for regulated industries.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Full Audit Logs",
    sub: "Complete decision history. Every policy evaluation, every escalation, every outcome — forever.",
  },
];

export function ComplianceStrip() {
  return (
    <section
      className="py-24"
      style={{
        borderTop: "1px solid #141414",
        background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(200,92,26,0.04) 0%, transparent 70%)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-14">
          <div className="mb-5">
            <SectionEyebrow align="center">Built for production</SectionEyebrow>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Enterprise-ready from day one.</h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
            The controls your security team will ask for before procurement — already built in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map(({ icon, title, sub }) => (
            <div
              key={title}
              className="compliance-card flex gap-4 rounded-lg px-5 py-5"
              style={{
                background: "#0c0c0c",
                border: "1px solid #1e1e1e",
                borderTop: "1px solid rgba(200,92,26,0.15)",
              }}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-md"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(200,92,26,0.07)",
                  border: "1px solid rgba(200,92,26,0.12)",
                  color: "var(--orange)",
                }}
              >
                {icon}
              </div>
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: "#e0e0e0" }}>{title}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#444" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

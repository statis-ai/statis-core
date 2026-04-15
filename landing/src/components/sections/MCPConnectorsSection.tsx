"use client";

// ---------------------------------------------------------------------------
// Company SVG logos — each takes a `color` prop for brand tinting
// ---------------------------------------------------------------------------
function GitHubLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function SlackLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 54 54" fill={color}>
      <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" opacity=".9"/>
      <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" opacity=".9"/>
      <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" opacity=".9"/>
      <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.249m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" opacity=".9"/>
    </svg>
  );
}
function SnowflakeLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      <rect x="46" y="5" width="8" height="90" rx="4"/>
      <rect x="5" y="46" width="90" height="8" rx="4"/>
      <rect x="18" y="18" width="8" height="64" rx="4" transform="rotate(45 22 50)"/>
      <rect x="18" y="18" width="64" height="8" rx="4" transform="rotate(45 50 22)"/>
      <circle cx="50" cy="50" r="9"/>
    </svg>
  );
}
// Airflow — windmill/fan with 3 blades (Apache Airflow's actual mark is a stylized "A" with wings,
// but the fan/propeller shape is the closest simple approximation)
function AirflowLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      {/* Center hub */}
      <circle cx="50" cy="50" r="9" />
      {/* Three blades at 0°, 120°, 240° */}
      <ellipse cx="50" cy="22" rx="7" ry="18" />
      <ellipse cx="50" cy="22" rx="7" ry="18" transform="rotate(120 50 50)" />
      <ellipse cx="50" cy="22" rx="7" ry="18" transform="rotate(240 50 50)" />
    </svg>
  );
}
function LinearLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      <path d="M11 54.3L45.7 89a44.5 44.5 0 0 1-34.7-34.7zM9.4 43.2L56.8 90.6A44.6 44.6 0 0 1 43.2 90.6L9.4 56.8A44.6 44.6 0 0 1 9.4 43.2zM13.7 32.6L67.4 86.3A44.7 44.7 0 0 1 56.8 90.6L9.4 43.2A44.7 44.7 0 0 1 13.7 32.6zM20.8 23.9L76.1 79.2A44.8 44.8 0 0 1 67.4 86.3L13.7 32.6A44.8 44.8 0 0 1 20.8 23.9zM30.1 17.4L82.6 69.9A44.6 44.6 0 0 1 76.1 79.2L20.8 23.9A44.6 44.6 0 0 1 30.1 17.4zM41 13.1L86.9 59A44.6 44.6 0 0 1 82.6 69.9L30.1 17.4A44.6 44.6 0 0 1 41 13.1zM53 11L89 47A44.5 44.5 0 0 1 86.9 59L41 13.1A44.5 44.5 0 0 1 53 11z"/>
    </svg>
  );
}
function NotionLogo({ color }: { color: string }) {
  return (
    <svg width="16" height="18" viewBox="0 0 76 86" fill={color}>
      <path fillRule="evenodd" d="M8.488 1.03 66.28.032c6.976 0 9.965 4.488 9.965 9.478v64.8c0 4.49-1.496 7.481-7.474 7.978l-62.3 3.99C.506 86.776 0 83.285 0 79.794V8.51C0 4.52 2.49 1.03 8.488 1.03zm52.82 10.97c-2 .5-3.5 2.5-3.5 4.5v52c0 2.5 1.5 4 4 4h4c2.5 0 4-1.5 4-4V16.5c0-2.5-1.5-4-4-4h-4.5zM14 17.5v51c0 2 1 3.5 3 3.5h4c2 0 3-1.5 3-3.5v-51c0-2-1-3.5-3-3.5h-4c-2 0-3 1.5-3 3.5zm18 0v51c0 2 1 3 3 3h4c2 0 3-1 3-3v-51c0-2-1-3-3-3h-4c-2 0-3 1-3 3z" clipRule="evenodd"/>
    </svg>
  );
}
function JiraLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" fill={color}>
      <path d="M196.5 125.4l-67.2-67.2-1.3-1.3-52.8 52.8a1.8 1.8 0 0 0 0 2.6l34.5 34.5 19.6 19.6a1.8 1.8 0 0 0 2.6 0l64.6-38.4c.7-.5.7-1.8 0-2.6zm-68.5 28.1l-19.6-19.6L89 114.6l39-39 19.6 19.6 19.6 19.6-39 38.7z"/>
    </svg>
  );
}
function SalesforceLogo({ color }: { color: string }) {
  return (
    <svg width="26" height="18" viewBox="0 0 140 100" fill={color}>
      <path d="M58 12c5-7 13-12 22-12 12 0 22 7 27 17 4-2 9-3 14-3 18 0 19 13 19 18 0 14-11 25-25 25H26C13 57 2 47 2 34c0-12 9-22 21-23 2-10 10-17 20-17 5 0 9 1.5 15 6z"/>
    </svg>
  );
}
function StripeLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 60 60" fill={color}>
      <path d="M60 30C60 13.431 46.569 0 30 0 13.431 0 0 13.431 0 30c0 16.569 13.431 30 30 30 16.569 0 30-13.431 30-30zm-33.39-9.42c0-1.953 1.602-2.7 4.26-2.7 3.816 0 8.64 1.152 12.456 3.204V10.44c-4.17-1.656-8.298-2.304-12.456-2.304C21.6 8.136 15 13.08 15 21.594c0 13.356 18.396 11.214 18.396 16.974 0 2.304-2.004 3.054-4.806 3.054-4.158 0-9.486-1.71-13.692-4.014v10.746c4.662 2.01 9.378 2.856 13.692 2.856 10.44 0 17.592-5.16 17.592-13.776C46.182 23.946 26.61 26.388 26.61 20.58z"/>
    </svg>
  );
}
function VercelLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="16" viewBox="0 0 116 100" fill={color}>
      <path d="M57.5 0L115 100H0L57.5 0z"/>
    </svg>
  );
}
function HubSpotLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      <circle cx="50" cy="50" r="14"/>
      <circle cx="50" cy="12" r="9"/>
      <circle cx="50" cy="88" r="9"/>
      <circle cx="12" cy="50" r="9"/>
      <circle cx="88" cy="50" r="9"/>
      <line x1="50" y1="36" x2="50" y2="21" stroke={color} strokeWidth="6"/>
      <line x1="50" y1="64" x2="50" y2="79" stroke={color} strokeWidth="6"/>
      <line x1="36" y1="50" x2="21" y2="50" stroke={color} strokeWidth="6"/>
      <line x1="64" y1="50" x2="79" y2="50" stroke={color} strokeWidth="6"/>
    </svg>
  );
}
function PostgresLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      <ellipse cx="55" cy="38" rx="28" ry="30"/>
      <path d="M27 38 Q20 60 30 80 Q40 95 55 90 Q70 85 72 68" fill="none" stroke={color} strokeWidth="8"/>
      <path d="M83 38 Q90 20 80 8 Q70 0 58 5" fill="none" stroke={color} strokeWidth="6"/>
      <ellipse cx="55" cy="38" rx="14" ry="16" fill="rgba(0,0,0,0.35)"/>
    </svg>
  );
}
function MongoDBLogo({ color }: { color: string }) {
  return (
    <svg width="13" height="18" viewBox="0 0 56 80" fill={color}>
      <path d="M28 0C14 18 8 30 8 44c0 12 9 22 20 24V80h0V68C39 66 48 56 48 44 48 30 42 18 28 0zm0 62c-8-2-14-9-14-18 0-10 5-20 14-34 9 14 14 24 14 34 0 9-6 16-14 18z"/>
    </svg>
  );
}
// Datadog — their mark is a dalmatian dog. Simplified: dog head silhouette with spots
function DatadogLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      {/* Head */}
      <ellipse cx="50" cy="42" rx="28" ry="26" />
      {/* Snout */}
      <ellipse cx="50" cy="60" rx="14" ry="10" />
      {/* Left ear */}
      <ellipse cx="28" cy="28" rx="10" ry="16" transform="rotate(-20 28 28)" />
      {/* Right ear */}
      <ellipse cx="72" cy="28" rx="10" ry="16" transform="rotate(20 72 28)" />
      {/* Spots */}
      <circle cx="42" cy="38" r="4" fill="rgba(0,0,0,0.35)" />
      <circle cx="60" cy="34" r="3" fill="rgba(0,0,0,0.35)" />
      <circle cx="55" cy="48" r="3.5" fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}
function KubernetesLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="42" stroke={color} strokeWidth="5"/>
      <polygon points="50,15 58,33 78,28 72,47 88,57 70,60 70,80 50,72 30,80 30,60 12,57 28,47 22,28 42,33" stroke={color} strokeWidth="4" fill={color} fillOpacity="0.2"/>
      <circle cx="50" cy="15" r="5" fill={color}/>
      <circle cx="85" cy="57" r="5" fill={color}/>
      <circle cx="65" cy="92" r="5" fill={color}/>
      <circle cx="35" cy="92" r="5" fill={color}/>
      <circle cx="15" cy="57" r="5" fill={color}/>
      <circle cx="50" cy="50" r="7" fill={color}/>
    </svg>
  );
}
function AWSLogo({ color }: { color: string }) {
  return (
    <svg width="28" height="16" viewBox="0 0 120 72" fill={color}>
      <path d="M34 44c0 1 .6 1.8 1.5 2.3l14 6.8c1.8.9 4 0 4.8-1.9l7.5-18.3 7.5 18.3c.8 1.9 3 2.8 4.8 1.9l14-6.8c.9-.5 1.5-1.3 1.5-2.3V26H82v14.7l-8.8-21.4c-.7-1.6-2.7-2.5-4.5-2-1.2.3-2.1 1.1-2.5 2L58 41.8 49.8 19.3c-.4-.9-1.3-1.7-2.5-2-1.8-.5-3.8.4-4.5 2L34 40.7V26H22v18z"/>
      <path d="M8 54c14.4 10.6 33 16 51 14.7 13-1 25-5.3 35-12.3l-3.5-4.7C81.8 58 70.7 62 59 63c-16.5 1.2-33-3.7-45.5-13.3L8 54z"/>
    </svg>
  );
}
// Zapier — orange Z bolt shape
function ZapierLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      <path d="M20 15 L80 15 L80 28 L38 28 L80 52 L80 58 L38 58 L80 85 L20 85 L20 72 L62 72 L20 48 L20 42 L62 42 L20 15Z"/>
    </svg>
  );
}

// PagerDuty — their logo is a stylized "PD" or a bell/alert shape
function PagerDutyLogo({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 56 76" fill={color}>
      {/* Vertical bar */}
      <rect x="0" y="0" width="14" height="76" rx="4" />
      {/* D-shape bump */}
      <path d="M14 8 Q50 8 50 28 Q50 48 14 48 Z" />
    </svg>
  );
}
// Sentry — their actual logo is a stylized face/mask shape
function SentryLogo({ color }: { color: string }) {
  return (
    <svg width="20" height="18" viewBox="0 0 200 180" fill={color}>
      <path d="M115 0a13 13 0 0 0-11 7L1 157a13 13 0 0 0 11 20h50a13 13 0 0 0 0-26H38l77-134 30 52a85 85 0 0 0-38 27H85a110 110 0 0 1 103-40l12-20A13 13 0 0 0 188 0z"/>
      <path d="M184 99a58 58 0 0 0-41 17l-12-20a85 85 0 0 1 97 29H120a31 31 0 0 1 64 0h13a13 13 0 0 0 11-20z"/>
    </svg>
  );
}
function BigQueryLogo({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" fill={color}>
      <circle cx="42" cy="42" r="30" fill="none" stroke={color} strokeWidth="8"/>
      <line x1="63" y1="63" x2="88" y2="88" stroke={color} strokeWidth="10" strokeLinecap="round"/>
      <circle cx="42" cy="42" r="12" fillOpacity="0.35"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Integration data — muted brand colors for each logo
// ---------------------------------------------------------------------------
type Integration = { name: string; color: string; icon: (color: string) => JSX.Element };

const ROW_ONE: Integration[] = [
  { name: "GitHub",     color: "#b0b0b0", icon: (c) => <GitHubLogo color={c} /> },
  { name: "Slack",      color: "#7B6EAB", icon: (c) => <SlackLogo color={c} /> },
  { name: "Snowflake",  color: "#4A8BC4", icon: (c) => <SnowflakeLogo color={c} /> },
  { name: "Stripe",     color: "#7B77C4", icon: (c) => <StripeLogo color={c} /> },
  { name: "Linear",     color: "#6B72C4", icon: (c) => <LinearLogo color={c} /> },
  { name: "Notion",     color: "#a0a0a0", icon: (c) => <NotionLogo color={c} /> },
  { name: "Jira",       color: "#4A7EC4", icon: (c) => <JiraLogo color={c} /> },
  { name: "Vercel",     color: "#a8a8a8", icon: (c) => <VercelLogo color={c} /> },
  { name: "Datadog",    color: "#7B50A4", icon: (c) => <DatadogLogo color={c} /> },
  { name: "Sentry",     color: "#7B6060", icon: (c) => <SentryLogo color={c} /> },
];

const ROW_TWO: Integration[] = [
  { name: "Airflow",    color: "#4A87C4", icon: (c) => <AirflowLogo color={c} /> },
  { name: "Salesforce", color: "#4AA8C4", icon: (c) => <SalesforceLogo color={c} /> },
  { name: "AWS",        color: "#C4873A", icon: (c) => <AWSLogo color={c} /> },
  { name: "Kubernetes", color: "#4A6EC4", icon: (c) => <KubernetesLogo color={c} /> },
  { name: "HubSpot",    color: "#C47060", icon: (c) => <HubSpotLogo color={c} /> },
  { name: "Postgres",   color: "#4A6EC4", icon: (c) => <PostgresLogo color={c} /> },
  { name: "MongoDB",    color: "#5A9E55", icon: (c) => <MongoDBLogo color={c} /> },
  { name: "BigQuery",   color: "#4A7EC4", icon: (c) => <BigQueryLogo color={c} /> },
  { name: "Zapier",     color: "#C46050", icon: (c) => <ZapierLogo color={c} /> },
  { name: "PagerDuty", color: "#5a9a6a", icon: (c) => <PagerDutyLogo color={c} /> },
];

function IntegrationChip({ name, color, icon }: Integration) {
  return (
    <div
      className="flex items-center gap-2.5 mx-2 px-4 py-2.5 rounded-lg shrink-0"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #1e1e1e",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>{icon(color)}</span>
      <span className="text-[11px] font-medium" style={{ color: "#777" }}>{name}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------
export function MCPConnectorsSection() {
  return (
    <section className="py-24" style={{ borderTop: "1px solid #141414" }}>

      {/* Centered header */}
      <div className="mx-auto max-w-3xl px-6 text-center mb-14">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-4 inline-block px-2 py-0.5 rounded"
          style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
        >
          Integrations
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
          Your agents call tools.<br />
          Statis makes sure they should.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
          MCP gives agents tool connectivity. Statis governs every call — policy gate,
          escalation path, tamper-evident receipt. Any MCP server, zero integration code.
        </p>
      </div>

      {/* Dual-row animated marquee */}
      <div
        className="mb-3 overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)" }}
      >
        {/* Row 1 — scrolls left */}
        <div className="flex mb-2.5" style={{ animation: "marquee-left 38s linear infinite" }}>
          {[...ROW_ONE, ...ROW_ONE, ...ROW_ONE].map((item, i) => (
            <IntegrationChip key={i} {...item} />
          ))}
        </div>
        {/* Row 2 — scrolls right */}
        <div className="flex" style={{ animation: "marquee-right 38s linear infinite" }}>
          {[...ROW_TWO, ...ROW_TWO, ...ROW_TWO].map((item, i) => (
            <IntegrationChip key={i} {...item} />
          ))}
        </div>
      </div>

      <p className="text-center text-[9px] uppercase tracking-[0.2em]" style={{ color: "#2e2e2e" }}>
        Any MCP server · stdio, HTTP, or SSE · zero integration code
      </p>

      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>

    </section>
  );
}

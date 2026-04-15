// Muted brand colors — recognizable but toned to fit the dark theme
type LogoItem = {
  name: string;
  color: string;
  icon: (c: string) => JSX.Element;
  // Float animation params — unique per chip so they drift independently
  floatDuration: number;
  floatDelay: number;
  floatY: number;   // max Y drift in px
  floatX: number;   // max X drift in px
};

function OpenAILogo({ color }: { color: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={color}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}
function AnthropicLogo({ color }: { color: string }) {
  return (
    <svg width="19" height="13" viewBox="0 0 77 55" fill={color}>
      <path d="M44.3 0h-12L56.1 55h12L44.3 0zM20.7 0 0 55h12.4l4.2-11.5h21.5L42.3 55h12.4L34 0H20.7zm-.1 33.7 7-19.2 7 19.2H20.6z" />
    </svg>
  );
}
function LangGraphLogo({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round">
      <circle cx="20" cy="50" r="12" fill={color} fillOpacity="0.2" />
      <circle cx="80" cy="20" r="12" fill={color} fillOpacity="0.2" />
      <circle cx="80" cy="80" r="12" fill={color} fillOpacity="0.2" />
      <line x1="32" y1="44" x2="68" y2="26" />
      <line x1="32" y1="56" x2="68" y2="74" />
      <line x1="80" y1="32" x2="80" y2="68" />
    </svg>
  );
}
function CrewAILogo({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill={color}>
      <circle cx="50" cy="28" r="13" />
      <circle cx="26" cy="70" r="11" />
      <circle cx="74" cy="70" r="11" />
      <line x1="50" y1="41" x2="34" y2="59" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="41" x2="66" y2="59" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
function LlamaIndexLogo({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill={color}>
      <ellipse cx="50" cy="70" rx="30" ry="22" />
      <rect x="42" y="38" width="16" height="24" rx="6" />
      <ellipse cx="50" cy="30" rx="14" ry="13" />
      <ellipse cx="60" cy="17" rx="5" ry="9" transform="rotate(15 60 17)" />
      <rect x="30" y="84" width="8" height="14" rx="4" />
      <rect x="62" y="84" width="8" height="14" rx="4" />
    </svg>
  );
}
function AutoGenLogo({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="38" stroke={color} strokeWidth="6" />
      <circle cx="50" cy="50" r="14" fill={color} fillOpacity="0.3" />
      <line x1="50" y1="12" x2="50" y2="36" stroke={color} strokeWidth="5" />
      <line x1="50" y1="64" x2="50" y2="88" stroke={color} strokeWidth="5" />
      <line x1="12" y1="50" x2="36" y2="50" stroke={color} strokeWidth="5" />
      <line x1="64" y1="50" x2="88" y2="50" stroke={color} strokeWidth="5" />
    </svg>
  );
}
function CursorLogo({ color }: { color: string }) {
  return (
    <svg width="15" height="19" viewBox="0 0 60 78" fill={color}>
      <path d="M5 5 L5 62 L21 46 L33 73 L41 70 L29 43 L50 43 Z" />
    </svg>
  );
}
function GeminiLogo({ color }: { color: string }) {
  return (
    <svg width="17" height="19" viewBox="0 0 68 78" fill={color}>
      <path d="M34 0 C34 19 52 33 68 39 C52 45 34 59 34 78 C34 59 16 45 0 39 C16 33 34 19 34 0Z" />
    </svg>
  );
}
function N8NLogo({ color }: { color: string }) {
  return (
    <svg width="26" height="15" viewBox="0 0 90 40" fill={color}>
      <text x="0" y="32" fontSize="38" fontWeight="bold" fontFamily="monospace" letterSpacing="-2">n8n</text>
    </svg>
  );
}
function MistralLogo({ color }: { color: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 100 100" fill={color}>
      <rect x="10" y="10" width="24" height="24" />
      <rect x="38" y="10" width="24" height="24" />
      <rect x="66" y="10" width="24" height="24" />
      <rect x="10" y="38" width="24" height="24" />
      <rect x="66" y="38" width="24" height="24" />
      <rect x="10" y="66" width="24" height="24" />
      <rect x="38" y="66" width="24" height="24" />
      <rect x="66" y="66" width="24" height="24" />
    </svg>
  );
}

const LOGOS: LogoItem[] = [
  { name: "OpenAI",     color: "#909090", floatDuration: 5.2, floatDelay: 0.0, floatY: 7,  floatX: 3,  icon: (c) => <OpenAILogo color={c} /> },
  { name: "Anthropic",  color: "#b08060", floatDuration: 6.8, floatDelay: 0.7, floatY: 5,  floatX: -4, icon: (c) => <AnthropicLogo color={c} /> },
  { name: "LangGraph",  color: "#5a9a6a", floatDuration: 4.5, floatDelay: 1.3, floatY: 8,  floatX: 5,  icon: (c) => <LangGraphLogo color={c} /> },
  { name: "CrewAI",     color: "#7878c4", floatDuration: 7.1, floatDelay: 0.4, floatY: 6,  floatX: -3, icon: (c) => <CrewAILogo color={c} /> },
  { name: "LlamaIndex", color: "#a07050", floatDuration: 5.7, floatDelay: 1.8, floatY: 9,  floatX: 4,  icon: (c) => <LlamaIndexLogo color={c} /> },
  { name: "AutoGen",    color: "#5a85b5", floatDuration: 6.3, floatDelay: 0.9, floatY: 5,  floatX: -5, icon: (c) => <AutoGenLogo color={c} /> },
  { name: "Cursor",     color: "#989898", floatDuration: 4.9, floatDelay: 2.2, floatY: 7,  floatX: 3,  icon: (c) => <CursorLogo color={c} /> },
  { name: "Gemini",     color: "#6a85b8", floatDuration: 7.4, floatDelay: 0.2, floatY: 6,  floatX: -4, icon: (c) => <GeminiLogo color={c} /> },
  { name: "n8n",        color: "#c06060", floatDuration: 5.5, floatDelay: 1.5, floatY: 8,  floatX: 5,  icon: (c) => <N8NLogo color={c} /> },
  { name: "Mistral",    color: "#8a78b8", floatDuration: 6.6, floatDelay: 0.6, floatY: 5,  floatX: -3, icon: (c) => <MistralLogo color={c} /> },
];

export function IntegrationsStrip() {
  return (
    <section
      className="py-8"
      style={{ borderTop: "1px solid #141414", borderBottom: "1px solid #141414" }}
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Label */}
        <p
          className="text-center text-[9px] uppercase tracking-[0.25em] mb-6"
          style={{ color: "#333" }}
        >
          Works with any agent framework
        </p>

        {/* Floating tile cloud */}
        <div className="flex flex-wrap justify-center gap-3">
          {LOGOS.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid rgba(${hexToRgb(item.color)}, 0.2)`,
                whiteSpace: "nowrap",
                animation: `float-chip-${item.name.toLowerCase().replace(/[^a-z]/g, '')} ${item.floatDuration}s ease-in-out ${item.floatDelay}s infinite alternate`,
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                {item.icon(item.color)}
              </span>
              <span className="text-[11px] font-medium" style={{ color: "#666" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-chip float keyframes — unique X/Y drift per chip */}
      <style>{LOGOS.map((item) => {
        const key = item.name.toLowerCase().replace(/[^a-z]/g, '');
        return `
          @keyframes float-chip-${key} {
            0%   { transform: translate(0px, 0px); }
            100% { transform: translate(${item.floatX}px, ${-item.floatY}px); }
          }
        `;
      }).join('')}</style>
    </section>
  );
}

// Minimal hex→r,g,b converter for border tinting
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

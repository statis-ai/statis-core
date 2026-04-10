type StatusLevel = "operational" | "degraded" | "down";

const STATUS_CONFIG: Record<StatusLevel, { dot: string; label: string }> = {
  operational: { dot: "#10B981", label: "All systems operational" },
  degraded: { dot: "#FACC15", label: "Degraded performance" },
  down: { dot: "#EF4444", label: "Service disruption" },
};

export function StatusPill({
  status = "operational",
  href = "https://status.statis.dev",
}: {
  status?: StatusLevel;
  href?: string;
}) {
  const { dot, label } = STATUS_CONFIG[status];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full transition-colors hover:bg-white/[0.06]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#A1A1AA",
      }}
    >
      <span className="relative flex items-center justify-center" style={{ width: 10, height: 10 }}>
        <span
          className="absolute rounded-full"
          style={{
            width: 10,
            height: 10,
            background: dot,
            opacity: 0.25,
            animation: "statusPing 1.8s ease-out infinite",
          }}
        />
        <span
          className="relative rounded-full"
          style={{ width: 6, height: 6, background: dot }}
        />
      </span>
      {label}
      <style>{`
        @keyframes statusPing {
          0% { transform: scale(0.6); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </a>
  );
}

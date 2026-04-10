export function LiveBadge({
  refreshSeconds = 10,
}: {
  refreshSeconds?: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full font-medium"
      style={{
        color: "#10B981",
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.24)",
      }}
    >
      <span className="relative flex items-center justify-center" style={{ width: 8, height: 8 }}>
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "#10B981",
            opacity: 0.35,
            animation: "livePulse 1.8s ease-out infinite",
          }}
        />
        <span
          className="relative rounded-full"
          style={{ width: 5, height: 5, background: "#10B981" }}
        />
      </span>
      Live · {refreshSeconds}s
      <style>{`
        @keyframes livePulse {
          0% { transform: scale(0.7); opacity: 0.6; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

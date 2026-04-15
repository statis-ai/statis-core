export const brand = {
  colors: {
    bg: "#000000",
    surface: "#0A0A0A",
    elevated: "#111111",
    border: "rgba(255,255,255,0.08)",
    borderHover: "rgba(255,255,255,0.15)",
    accent: "#00D4FF",
    accentGlow: "rgba(0,212,255,0.12)",
    text: "#EDEDED",
    text2: "#888888",
    textMuted: "#555555",
    success: "#34D399",
    warn: "#FACC15",
    error: "#F87171",
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  motion: {
    durationFast: 150,
    durationDefault: 300,
    durationSlow: 600,
  },
  typography: {
    fontSans: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", "Fira Code", monospace',
  },
} as const;

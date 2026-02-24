export const brand = {
  colors: {
    statist: "#0a0a0f",
    surface: "rgba(255, 255, 255, 0.03)",
    border: "rgba(255, 255, 255, 0.06)",
    accent: "#00ffc8",
    accentDim: "rgba(0, 255, 200, 0.15)",
    muted: "#8a8a9a",
    success: "#22c55e",
    warn: "#f59e0b",
    text: "#e4e4e7",
    textBright: "#ffffff",
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  shadows: {
    glow: "0 0 20px rgba(0, 255, 200, 0.15)",
    glowSm: "0 0 10px rgba(0, 255, 200, 0.15)",
    glowLg: "0 0 40px rgba(0, 255, 200, 0.2)",
  },
  motion: {
    durationFast: 150,
    durationDefault: 300,
    durationSlow: 600,
    durationReveal: 800,
  },
  typography: {
    fontSans: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", "Fira Code", monospace',
  },
} as const;

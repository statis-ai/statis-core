import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          statist: "var(--color-statist)",
          surface: "var(--color-surface)",
          border: "var(--color-border)",
          accent: "var(--color-accent)",
          "accent-dim": "var(--color-accent-dim)",
          muted: "var(--color-muted)",
          success: "var(--color-success)",
          warn: "var(--color-warn)",
          "flow-blue": "var(--color-flow-blue)",
          "alert-high": "var(--color-alert-high)",
          "alert-medium": "var(--color-alert-medium)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Playfair Display", "serif"],
      },
      boxShadow: {
        glow: "0 0 20px var(--color-accent-dim)",
        "glow-sm": "0 0 10px var(--color-accent-dim)",
      },
    },
  },
  plugins: [],
};

export default config;

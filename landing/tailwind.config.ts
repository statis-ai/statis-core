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
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        glow: "0 0 20px var(--color-accent-dim)",
        "glow-sm": "0 0 10px var(--color-accent-dim)",
        "glow-lg": "0 0 40px rgba(0, 255, 200, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;

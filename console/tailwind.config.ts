import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:           "var(--bg)",
          deep:         "var(--bg-deep)",
          paper:        "var(--paper)",
          rule:         "var(--rule)",
          "rule-soft":  "var(--rule-soft)",
          ink:          "var(--ink)",
          "ink-soft":   "var(--ink-soft)",
          muted:        "var(--ink-muted)",
          subtle:       "var(--ink-subtle)",
          accent:       "var(--accent)",
          "accent-deep":"var(--accent-deep)",
          "accent-tint":"var(--accent-tint)",
          seal:         "var(--seal)",
          good:         "var(--good)",
          warn:         "var(--warn)",
          bad:          "var(--bad)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        lg: "8px",
        cmdk: "6px",
      },
      boxShadow: {
        frame: "0 1px 0 rgba(0,0,0,0.02), 0 8px 24px -12px rgba(60,40,20,0.10)",
        cmdk: "0 2px 4px rgba(0,0,0,0.04), 0 12px 32px -8px rgba(60,40,20,0.18), 0 40px 64px -24px rgba(60,40,20,0.22)",
      },
    },
  },
  plugins: [],
};

export default config;

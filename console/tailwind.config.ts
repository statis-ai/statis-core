import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 12-token palette — ref: 01-design-system.md § 01
        bg:          "var(--bg)",
        "bg-deep":   "var(--bg-deep)",
        paper:       "var(--paper)",
        ink:         "var(--ink)",
        "ink-soft":  "var(--ink-soft)",
        "ink-muted": "var(--ink-muted)",
        rule:        "var(--rule)",
        "rule-soft": "var(--rule-soft)",
        accent:      "var(--accent)",
        "accent-deep": "var(--accent-deep)",
        seal:        "var(--seal)",
        amber:       "var(--amber)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Locked type scale — use these sizes; no arbitrary values.
        display: ["52px", { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "300" }],
        title:   ["30px", { lineHeight: "1.15", letterSpacing: "-0.035em", fontWeight: "500" }],
        heading: ["20px", { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "500" }],
        subhead: ["16px", { lineHeight: "1.3",  letterSpacing: "-0.02em",  fontWeight: "500" }],
        body:    ["14.5px", { lineHeight: "1.65", letterSpacing: "-0.005em" }],
        "body-sm": ["13px", { lineHeight: "1.55", letterSpacing: "-0.005em" }],
        meta:    ["12px", { lineHeight: "1.5",  letterSpacing: "-0.005em" }],
        label:   ["10px", { lineHeight: "1.4",  letterSpacing: "0.14em" }],
        eyebrow: ["11px", { lineHeight: "1.4",  letterSpacing: "0.18em" }],
        micro:   ["9.5px", { lineHeight: "1.4", letterSpacing: "0.14em" }],
      },
      borderRadius: {
        none: "0",
        sm:   "2px",
        DEFAULT: "3px",
        md:   "3px",
        lg:   "4px",
        cmdk: "6px",
      },
      boxShadow: {
        frame: "0 1px 0 rgba(0,0,0,0.02), 0 8px 24px -12px rgba(60,40,20,0.1)",
        cmdk:
          "0 2px 4px rgba(0,0,0,0.04), 0 12px 32px -8px rgba(60,40,20,0.18), 0 40px 64px -24px rgba(60,40,20,0.22)",
      },
      transitionTimingFunction: {
        panel: "cubic-bezier(0.2, 0.8, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

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
          bg: "var(--bg)",
          surface: "var(--bg-surface)",
          border: "var(--border)",
          text: "var(--text)",
          "text-2": "var(--text-2)",
          muted: "var(--text-muted)",
          highlight: "var(--highlight)",
        },
      },
      fontFamily: {
        sans: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;

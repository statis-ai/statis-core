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
          statist: "#0a0a0f",
          surface: "#111118",
          border: "#23232f",
          accent: "#00ffc8",
          "accent-dim": "rgba(0,255,200,0.12)",
          muted: "#6b6b80",
          success: "#22c55e",
          warn: "#f59e0b",
          error: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

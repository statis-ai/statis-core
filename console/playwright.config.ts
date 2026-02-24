import { defineConfig, devices } from "@playwright/test";

const API_URL = process.env.API_URL ?? "http://localhost:8001";
const CONSOLE_URL = process.env.CONSOLE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: CONSOLE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `uvicorn app.main:app --host 0.0.0.0 --port 8001`,
      cwd: "../api",
      url: `${API_URL}/health`,
      reuseExistingServer: true,
      timeout: 15_000,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ?? "postgresql+psycopg://statis:statis@localhost:5433/statis",
      },
    },
    {
      command: "npm run dev",
      url: CONSOLE_URL,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});

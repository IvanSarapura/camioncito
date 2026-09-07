import { defineConfig, devices } from "@playwright/test";

const isCI = process.env.CI === "true";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: isCI
      ? "npm run start -- --port 3100"
      : "npm run build && npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !isCI,
  },
});

import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a production build with a fake NAVER Maps SDK (e2e/fixtures.ts).
// Run manually or in CI: pnpm e2e
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    // vite preview's default port.
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    // The fake SDK accepts any Client ID; a real one is never needed for tests.
    env: { VITE_NAVER_MAP_CLIENT_ID: "e2e" },
  },
});

// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

const CI = !!process.env.CI;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Ticket server: TICKET_PRINTER=false ensures the spinner skips print and
      // pushes straight to /ticketdisplay so we don't need Arduino hardware.
      command: 'TICKET_PRINTER=false node server.js',
      url: 'http://localhost:3002/printer-status',
      reuseExistingServer: !CI,
      timeout: 30_000,
    },
    {
      // Serve the CRA production build. `npm run test:e2e:build` (defined in
      // package.json) produces the build with tuned delays baked in.
      command: 'npm run test:e2e:build && npx serve -s build -l 3000',
      url: 'http://localhost:3000',
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
  ],
});

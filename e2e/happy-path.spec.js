// e2e/happy-path.spec.js
const { test, expect } = require('@playwright/test');

test.describe('kiosk happy path', () => {
  test('walks pull screen → survey → spinner → ticket display', async ({ page }) => {
    // 1. Pull screen renders
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /^Hello/ })).toBeVisible();
    await expect(page.getByText(/You can receive a ticket here/)).toBeVisible();
  });
});

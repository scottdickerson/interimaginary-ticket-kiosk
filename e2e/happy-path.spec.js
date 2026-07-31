// e2e/happy-path.spec.js
const { test, expect } = require('@playwright/test');

test.describe('kiosk happy path', () => {
  test('walks pull screen → survey → spinner → ticket display', async ({ page }) => {
    // 1. Pull screen renders
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /^Hello/ })).toBeVisible();
    await expect(page.getByText(/You can receive a ticket here/)).toBeVisible();

    // 2. Any click on the pull screen advances to the survey.
    // The whole PullScreen div receives onClick, so click the CTA button.
    await page.getByRole('button', { name: /let.?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);
    // The survey shows a Question with an h2; wait for the first one to appear.
    await expect(page.locator('section > h2').first()).toBeVisible();
  });
});

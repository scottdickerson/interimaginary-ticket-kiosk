// e2e/happy-path.spec.js
const { test, expect } = require('@playwright/test');

test.describe('kiosk happy path', () => {
  test('walks pull screen → survey → spinner → ticket display', async ({ page }) => {
    // 1. Pull screen renders
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /^Hello/ })).toBeVisible();
    await expect(page.getByText(/You can receive a ticket here/)).toBeVisible();

    // 2. Advance to survey
    await page.getByRole('button', { name: /let.?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);
    await expect(page.locator('section > h2').first()).toBeVisible();

    // 3. Walk through 6 questions.
    // Each question has an h2 followed by 3 choice buttons rendered by SimpleChoiceRenderer.
    // Selecting a choice starts a bunny progress animation; the next question
    // renders once the animation's onFinished fires.
    for (let i = 0; i < 6; i++) {
      const previousQuestion = await page.locator('section > h2').first().innerText();

      // Click the first choice available. All regular questions have 3 choices.
      // Scope to the Question <section> (which has an h2 direct child) so we
      // don't accidentally match the underlying PullScreen's button.
      await page.locator('section:has(> h2) button').first().click();

      // Wait for either the next question to render (h2 text changes) OR
      // the URL to transition to /ticket. If it transitions, break the loop.
      await Promise.race([
        page.waitForURL(/\/ticket$/, { timeout: 30_000 }),
        page.locator('section > h2').first().filter({ hasNotText: previousQuestion }).waitFor({ timeout: 30_000 }),
      ]);

      if (/\/ticket$/.test(page.url())) break;
    }

    // 4. Confirm we reached the spinner
    await expect(page).toHaveURL(/\/ticket$/);

    // 5. Spinner advances to ticket display (~100ms delay from
    // REACT_APP_TICKET_WORKING_DELAY_MS, plus the SSE tick from
    // /printer-status confirming printerOk=false).
    await page.waitForURL(/\/ticketdisplay$/, { timeout: 15_000 });

    // 6. Ticket display fetches GET /ticket from the server and renders
    // a destination heading + a QR code (svg).
    // react-qr-code v2.0.16 renders an <svg> whose viewBox size is the QR
    // module count (varies by encoded URL length), so match by width/height
    // instead — the component sets both to the `size` prop (75 here).
    const qrCode = page.locator('svg[width="75"][height="75"]');
    await expect(qrCode).toBeVisible();

    // Verify the destination heading text is non-empty.
    const destinationHeading = page.getByRole('heading').first();
    await expect(destinationHeading).toBeVisible();
    const destinationText = await destinationHeading.innerText();
    expect(destinationText.trim().length).toBeGreaterThan(0);
  });
});

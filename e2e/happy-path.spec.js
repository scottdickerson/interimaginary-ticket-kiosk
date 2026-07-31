// e2e/happy-path.spec.js
const { test, expect } = require('@playwright/test');

// Walk the 6-question survey by clicking the first choice of each question
// and waiting for the h2 text to change (or the URL to reach /ticket).
async function completeSurvey(page) {
  for (let i = 0; i < 6; i++) {
    const previousQuestion = await page.locator('section > h2').first().innerText();
    await page.locator('section:has(> h2) button').first().click();
    await Promise.race([
      page.waitForURL(/\/ticket$/, { timeout: 30_000 }),
      page.locator('section > h2').first().filter({ hasNotText: previousQuestion }).waitFor({ timeout: 30_000 }),
    ]);
    if (/\/ticket$/.test(page.url())) break;
  }
}

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

    // 3. Walk through 6 survey questions
    await completeSurvey(page);

    // 4. Confirm we reached the spinner
    await expect(page).toHaveURL(/\/ticket$/);

    // 5. Spinner advances to ticket display (~100ms delay from
    // REACT_APP_TICKET_WORKING_DELAY_MS, plus the SSE tick from
    // /printer-status confirming printerOk=false).
    await page.waitForURL(/\/ticketdisplay$/, { timeout: 15_000 });

    // 6. Ticket display renders destination + QR code.
    // react-qr-code v2.0.16 renders an <svg> whose viewBox size is the QR
    // module count (varies by encoded URL length), so match by width/height
    // instead — the component sets both to the `size` prop (75 here).
    const qrCode = page.locator('svg[width="75"][height="75"]');
    await expect(qrCode).toBeVisible();
    const destinationHeading = page.getByRole('heading').first();
    await expect(destinationHeading).toBeVisible();
    const destinationText = await destinationHeading.innerText();
    expect(destinationText.trim().length).toBeGreaterThan(0);
  });

  test('inactivity returns user to pull screen from /main (fake clock)', async ({ page }) => {
    // MAIN_SCREEN_PAGE_DELAY is hardcoded to 45000ms in src/App.js. We can't
    // shorten it via env, and we don't want to wait 45s of real time in CI,
    // so we install a fake clock and fast-forward past the delay.
    // page.clock.install() must be called BEFORE the first page.goto so it
    // applies to timers set during page load.
    await page.clock.install();

    // Click through the pull screen to reach /main (no page.goto shortcut).
    await page.goto('/');
    await page.getByRole('button', { name: /let.?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);
    await expect(page.locator('section > h2').first()).toBeVisible();

    // No further interaction — advance the fake clock past 45s and
    // PullScreen.onReset pushes back to /.
    await page.clock.fastForward(60_000);
    await expect(page).toHaveURL(/\/$/);
  });

  test('inactivity returns user to pull screen after walking through survey to spinner and ticket display', async ({ page }) => {
    // Real wall-time waits — the /ticket and /ticketdisplay inactivity
    // delays are already 6000ms in the test build, so 6-8s per case is fine.
    // No fake clock — the survey walk has bunny animations (setTimeout-driven)
    // that would need per-step fast-forwarding under a fake clock.

    await page.goto('/');
    await page.getByRole('button', { name: /let.?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);

    // Click through the 6-question survey to reach /ticket.
    await completeSurvey(page);
    await expect(page).toHaveURL(/\/ticket$/);

    // Stop interacting. Two things happen without any input:
    // (a) The spinner's own 100ms setTimeout fires and pushes to /ticketdisplay
    //     (because TICKET_PRINTER=false makes printerOk=false).
    // (b) On /ticketdisplay, we confirm the QR code svg rendered — proving
    //     the redirect below is from the inactivity timer, not a load failure.
    // (c) The 6000ms /ticketdisplay inactivity timer fires and returns to /.
    await page.waitForURL(/\/ticketdisplay$/, { timeout: 15_000 });
    await expect(page.locator('svg[width="75"][height="75"]')).toBeVisible();
    await page.waitForURL(/\/$/, { timeout: 15_000 });
  });
});

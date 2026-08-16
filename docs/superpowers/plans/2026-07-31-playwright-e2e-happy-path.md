# Playwright E2E Happy-Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Playwright E2E happy-path test that walks the entire kiosk flow (pull → survey → spinner → ticket display) with the Node ticket server running, plus a CI workflow that runs it on every push/PR.

**Architecture:** Playwright drives Chromium against a locally-served production build (`serve -s build`) on port 3000, while `node server.js` runs on port 3002 supplying `/ticket`, `/printer-status`, and `/email`. Playwright's `webServer` config launches both. Environment tuning skips real print by setting `TICKET_PRINTER=false` on the server (which makes the spinner advance immediately once its short delay elapses) and shortens client-side delays via `REACT_APP_*` env vars at build time.

**Tech Stack:** `@playwright/test`, Node 22 (`.nvmrc`), CRA 4 production build, `serve`, GitHub Actions Ubuntu runner.

---

## Context the engineer needs

The kiosk is a CRA 4 React app with 4 routes defined in `src/constants/constants.js`:

```js
export const ROUTES = {
  PULLSCREEN: '/',
  MAINSCREEN: '/main',
  TICKETSPINNER: '/ticket',
  TICKETDISPLAY: '/ticketdisplay',
};
```

Flow:
1. `/` (PULLSCREEN) — attract screen. Text: `Hello...`. The whole screen is a clickable div (`src/containers/TicketPullScreen/TicketPullScreen.jsx:22`, `onClick={isFrontScreen ? handleClick : undefined}`). Any click navigates to `/main`.
2. `/main` (survey) — 6 randomly-shuffled questions from `src/containers/TicketSurvey/TicketSurvey.jsx`. Each question renders in `src/components/Question/Question.jsx`. Regular questions (3 choices) use `SimpleChoiceRenderer`. **Selecting a choice does NOT immediately advance** — it starts a bunny progress animation, then `onSelection()` fires after the animation completes and the next question renders. Between clicks, the test must wait for the new question's `h2` to be visible.
3. `/ticket` (TicketSpinner) — waits `REACT_APP_TICKET_WORKING_DELAY_MS` (default 20000ms) then either calls `/printTicket` OR pushes to `/ticketdisplay`. When the server reports `printerOk: false` (`TICKET_PRINTER=false` env), the spinner skips print and pushes to `/ticketdisplay`. **This is the mechanism we use to bypass print hardware in tests.**
4. `/ticketdisplay` — fetches `GET /ticket` from the server, renders `TicketDetails` with `destinationName` heading and a `<QRCode value={ticketURL} />`.

Server (`server.js`) starts fine without an Arduino — `new five.Board()` is async and just never fires `ready`. Endpoints work as-is. Uses `printerOk` state initialized from `process.env.TICKET_PRINTER !== 'false'`.

## File Structure

- Create `playwright.config.js` — Playwright config: chromium project, two `webServer` entries (server on 3002, serve on 3000), baseURL, trace/screenshot on failure.
- Create `e2e/happy-path.spec.js` — the sole happy-path spec.
- Create `.github/workflows/e2e.yml` — CI workflow: Ubuntu, Node from `.nvmrc`, `npm ci`, `npx playwright install --with-deps chromium`, build the app, run Playwright, upload report on failure.
- Modify `package.json` — add `@playwright/test` devDep, add `test:e2e` and `test:e2e:build` scripts.
- Modify `.gitignore` — ignore Playwright output dirs.

---

## Task 1: Install Playwright and initialize config

**Files:**
- Modify: `package.json` (add devDep + scripts)
- Modify: `.gitignore` (ignore Playwright artifacts)
- Create: `playwright.config.js`

- [ ] **Step 1: Install `@playwright/test`**

```bash
npm install --save-dev @playwright/test@^1.48.0
```

Expected: package.json gains `"@playwright/test": "^1.48.0"` in devDependencies. `package-lock.json` updates.

- [ ] **Step 2: Install Chromium browser binary for local runs**

```bash
npx playwright install chromium
```

Expected: silent success. Downloads Chromium to `~/Library/Caches/ms-playwright/`.

- [ ] **Step 3: Create `playwright.config.js`**

Full file contents to write:

```js
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
```

The build-time env vars are set on the `test:e2e:build` npm script in the next step — that's the single source of truth. Playwright's webServer just invokes that script.

The chosen delay values (6000ms for inactivity everywhere, 100ms for spinner auto-advance) are a balance between two competing needs:

- **Happy-path test** must complete each screen's interaction within 6000ms of the previous click (bunny animation ~1-2s + Playwright click overhead), so inactivity doesn't fire mid-flow.
- **Inactivity test** waits ~6000ms of idle on each subscreen to trigger the timer.

If either test flakes, adjust the delays together — they're one dial with two constraints.

- [ ] **Step 4: Add `test:e2e` and `test:e2e:build` scripts to `package.json`**

Edit `package.json` scripts. The existing scripts section looks like this:

```json
"scripts": {
  "start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start",
  "start:prod": "serve -s build",
  "build": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts build",
  "test": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts test",
  "eject": "react-scripts eject",
  "verify:dam-urls": "node src/data/urlVerifier.js"
},
```

Add two new scripts so it becomes:

```json
"scripts": {
  "start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start",
  "start:prod": "serve -s build",
  "build": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts build",
  "test": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts test",
  "eject": "react-scripts eject",
  "verify:dam-urls": "node src/data/urlVerifier.js",
  "test:e2e": "playwright test",
  "test:e2e:build": "cross-env NODE_OPTIONS=--openssl-legacy-provider REACT_APP_TICKET_WORKING_DELAY_MS=100 REACT_APP_TICKET_PRINTED_SCREEN_DELAY_MS=6000 REACT_APP_DIGITAL_TICKET_SCREEN_DELAY_MS=6000 REACT_APP_SHOW_DIAGNOSTICS=false SKIP_PREFLIGHT_CHECK=true react-scripts build"
},
```

The `test:e2e:build` script bakes the tuned client delays into the production build:

- `REACT_APP_TICKET_WORKING_DELAY_MS=100` — spinner auto-advance is nearly instant so the happy-path test doesn't wait 20s at `/ticket`
- `REACT_APP_TICKET_PRINTED_SCREEN_DELAY_MS=6000` — spinner inactivity (rarely observable — spinner auto-advances long before this)
- `REACT_APP_DIGITAL_TICKET_SCREEN_DELAY_MS=6000` — ticket display inactivity, used by the inactivity test

Note: `/main`'s inactivity delay is hardcoded to 45000ms in `src/App.js` and there is no env var override. We do **not** modify `App.js` — the inactivity test in Task 6 uses Playwright's `page.clock` to fast-forward past that 45s wait without touching product code.

- [ ] **Step 5: Update `.gitignore`**

The current `.gitignore` starts with:

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
# repo uses npm; yarn.lock is ignored to prevent lockfile drift
yarn.lock
```

Add a new section after the `# production` section (around line 12). The final file should have this section added:

```
# playwright
/playwright-report
/test-results
/blob-report
/playwright/.cache
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json playwright.config.js .gitignore
git commit -m "chore(e2e): install Playwright, add config and scripts"
```

---

## Task 2: Write the happy-path spec — pull screen loads

**Files:**
- Create: `e2e/happy-path.spec.js`

- [ ] **Step 1: Create the file with just the smoke assertion**

Full contents:

```js
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
```

- [ ] **Step 2: Run the test locally**

```bash
npm run test:e2e
```

Expected: Playwright builds the client (~30-60s the first time), starts both servers, launches Chromium, navigates to `/`, and the assertion passes. Test title: `[chromium] › happy-path.spec.js:5:3 › kiosk happy path › walks pull screen → survey → spinner → ticket display`. If it fails, run `npx playwright show-report` and check the trace.

- [ ] **Step 3: Commit**

```bash
git add e2e/happy-path.spec.js
git commit -m "test(e2e): pull screen smoke test"
```

---

## Task 3: Extend spec — pull screen click advances to survey

**Files:**
- Modify: `e2e/happy-path.spec.js`

- [ ] **Step 1: Add the click and next-screen assertion**

Replace the current test body with:

```js
  test('walks pull screen → survey → spinner → ticket display', async ({ page }) => {
    // 1. Pull screen renders
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /^Hello/ })).toBeVisible();
    await expect(page.getByText(/You can receive a ticket here/)).toBeVisible();

    // 2. Any click on the pull screen advances to the survey.
    // The whole PullScreen div receives onClick, so click the CTA button.
    await page.getByRole('button', { name: /let'?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);
    // The survey shows a Question with an h2; wait for the first one to appear.
    await expect(page.locator('section > h2').first()).toBeVisible();
  });
```

- [ ] **Step 2: Run**

```bash
npm run test:e2e
```

Expected: PASS. If the URL check fails, look at the trace — `getByRole('button', { name: /let'?s begin/i })` should match "OK let's begin" text (`src/containers/TicketPullScreen/TicketPullScreen.jsx:32-37`).

- [ ] **Step 3: Commit**

```bash
git add e2e/happy-path.spec.js
git commit -m "test(e2e): advance from pull screen to survey"
```

---

## Task 4: Extend spec — walk through 6 survey questions

**Files:**
- Modify: `e2e/happy-path.spec.js`

Background: each Question renders an `h2` at the top. Clicking a choice starts a bunny animation, THEN `onSelection` fires and the next question renders. The test must poll for the new h2 text to change between clicks. Since questions are shuffled, we don't know the text — instead, capture the current h2 text, click a choice, then wait for the h2 text to change or the URL to become `/ticket`.

- [ ] **Step 1: Add the survey loop**

Replace the test body with:

```js
  test('walks pull screen → survey → spinner → ticket display', async ({ page }) => {
    // 1. Pull screen renders
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /^Hello/ })).toBeVisible();
    await expect(page.getByText(/You can receive a ticket here/)).toBeVisible();

    // 2. Advance to survey
    await page.getByRole('button', { name: /let'?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);
    await expect(page.locator('section > h2').first()).toBeVisible();

    // 3. Walk through 6 questions.
    // Each question has an h2 followed by 3 choice buttons rendered by SimpleChoiceRenderer.
    // Selecting a choice starts a bunny progress animation; the next question
    // renders once the animation's onFinished fires.
    for (let i = 0; i < 6; i++) {
      const previousQuestion = await page.locator('section > h2').first().innerText();

      // Click the first choice available. All regular questions have 3 choices.
      // Scope the click to buttons that are NOT the survey Header buttons
      // (Header has "back" / "close" buttons above the Question section).
      await page.locator('section button').first().click();

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
  });
```

Note: the `Promise.race` handles both the "next question" and "survey finished" cases in one waiter. If the last question was clicked, the URL transition wins the race.

- [ ] **Step 2: Run**

```bash
npm run test:e2e
```

Expected: PASS. Playwright walks through 6 questions and lands on `/ticket`. If a click doesn't register on a Question button (e.g., because the selector picks the Header's back button instead), inspect the trace and refine the selector.

- [ ] **Step 3: Commit**

```bash
git add e2e/happy-path.spec.js
git commit -m "test(e2e): walk through 6 survey questions to spinner"
```

---

## Task 5: Extend spec — spinner advances to ticket display + assert content

**Files:**
- Modify: `e2e/happy-path.spec.js`

Background: TicketSpinner (`src/containers/TicketSpinner/TicketSpinner.jsx:46-65`) waits `REACT_APP_TICKET_WORKING_DELAY_MS` (100ms in our config), reads `isPrinterConfigured`, and — because we set `TICKET_PRINTER=false` on the server so `printerOk=false` — pushes to `/ticketdisplay`. On `/ticketdisplay`, `TicketDisplayScreen` fetches `GET /ticket` and renders `TicketDetails` with the destination name and a QR code.

- [ ] **Step 1: Add the spinner → display assertion**

Add after the existing spinner assertion, replacing the final `await expect(page).toHaveURL(/\/ticket$/);` line with:

```js
    // 4. Confirm we reached the spinner
    await expect(page).toHaveURL(/\/ticket$/);

    // 5. Spinner advances to ticket display (~100ms delay from
    // REACT_APP_TICKET_WORKING_DELAY_MS, plus the SSE tick from
    // /printer-status confirming printerOk=false).
    await page.waitForURL(/\/ticketdisplay$/, { timeout: 15_000 });

    // 6. Ticket display fetches GET /ticket from the server and renders
    // a destination heading + a QR code (svg).
    // The destination name comes from a random row in DAM_URLs.csv, so we
    // don't hardcode it — just assert *some* non-empty destination heading
    // appears and the QR code SVG is present.
    const qrCode = page.locator('svg[viewBox="0 0 256 256"]');
    await expect(qrCode).toBeVisible();

    // Assert the QR code encodes a Widen DAM direct-download URL by checking
    // the ticketURL passed to react-qr-code. react-qr-code renders its value
    // as a data-* attr on the svg root; if not, we can grab it from the DOM.
    // Simplest: verify the destination heading text is non-empty.
    const destinationHeading = page.getByRole('heading').first();
    await expect(destinationHeading).toBeVisible();
    const destinationText = await destinationHeading.innerText();
    expect(destinationText.trim().length).toBeGreaterThan(0);
  });
```

- [ ] **Step 2: Run**

```bash
npm run test:e2e
```

Expected: PASS. The full flow now runs end-to-end. If the QR code selector doesn't match, inspect the DOM via `npx playwright test --debug` and refine — react-qr-code v2.0.16 renders a `<svg>` root.

- [ ] **Step 3: Commit**

```bash
git add e2e/happy-path.spec.js
git commit -m "test(e2e): assert ticket display renders destination + QR code"
```

---

## Task 6: Add inactivity tests — click through, then verify redirect from each subscreen

**Files:**
- Modify: `e2e/happy-path.spec.js` (extract a survey-walking helper, add two inactivity tests)

**No product code changes.** `src/App.js` and `src/components/PullScreen/PullScreen.jsx` are untouched.

Background — inactivity delays per screen (`src/App.js:19-27`):

- `/main` (survey): `MAIN_SCREEN_PAGE_DELAY` = **45000ms hardcoded** in App.js, no env override
- `/ticket` (spinner): `REACT_APP_TICKET_PRINTED_SCREEN_DELAY_MS` = 6000ms in our test build (Task 1)
- `/ticketdisplay`: `REACT_APP_DIGITAL_TICKET_SCREEN_DELAY_MS` = 6000ms in our test build (Task 1)

**Test approach — split into two tests to isolate concerns:**

1. **`/main` inactivity** uses Playwright's `page.clock` to install a fake clock and fast-forward past the 45s hardcoded delay without touching product code. Cannot use real wall-time (45s per test run wastes CI). Cannot lower the delay without changing App.js.
2. **`/ticket` + `/ticketdisplay` inactivity** uses **real wall-time waits** against the 6000ms delays. This test walks the full survey to reach `/ticket`, stops interacting, and asserts the eventual landing on `/` — which covers both the `/ticket → /ticketdisplay` spinner auto-advance chain and the `/ticketdisplay → /` inactivity timer. The intermediate `/ticketdisplay` render is explicitly asserted mid-flow so we know the redirect below is from inactivity, not a load failure.

**Why not `page.clock` for everything:** the survey walk involves the bunny progress animation between questions (setTimeout-driven), so a fake clock would need to be advanced precisely to complete each animation without tripping the inactivity timer. Real time is much simpler for the survey walk.

**Nuance for `/ticket` in test 2:** the spinner has its own 100ms setTimeout (`src/containers/TicketSpinner/TicketSpinner.jsx:47-61`) that auto-navigates to `/ticketdisplay` — this fires long before the 6000ms `/ticket` inactivity delay could. So "inactivity from `/ticket`" always chains through `/ticketdisplay` in practice. Test 2 verifies that chain lands home without any user interaction, which is what the safety-net timer actually needs to guarantee.

- [ ] **Step 1: Refactor `e2e/happy-path.spec.js` to extract a shared survey helper**

Move the survey-walking loop into a module-level `completeSurvey` helper so both the happy-path test and the new inactivity test share the exact same walk. The full new file contents:

```js
// e2e/happy-path.spec.js
const { test, expect } = require('@playwright/test');

// Walk the 6-question survey by clicking the first choice of each question
// and waiting for the h2 text to change (or the URL to reach /ticket).
async function completeSurvey(page) {
  for (let i = 0; i < 6; i++) {
    const previousQuestion = await page.locator('section > h2').first().innerText();
    await page.locator('section button').first().click();
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
    await page.getByRole('button', { name: /let'?s begin/i }).click();
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

    // 6. Ticket display renders destination + QR code
    const qrCode = page.locator('svg[viewBox="0 0 256 256"]');
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
    await page.getByRole('button', { name: /let'?s begin/i }).click();
    await expect(page).toHaveURL(/\/main$/);
    await expect(page.locator('section > h2').first()).toBeVisible();

    // No further interaction — advance the fake clock past 45s and
    // PullScreen.onReset pushes back to /.
    await page.clock.fastForward('60s');
    await expect(page).toHaveURL(/\/$/);
  });

  test('inactivity returns user to pull screen after walking through survey to spinner and ticket display', async ({ page }) => {
    // Real wall-time waits — the /ticket and /ticketdisplay inactivity
    // delays are already 6000ms in the test build, so 6-8s per case is fine.
    // No fake clock — the survey walk has bunny animations (setTimeout-driven)
    // that would need per-step fast-forwarding under a fake clock.

    await page.goto('/');
    await page.getByRole('button', { name: /let'?s begin/i }).click();
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
    await expect(page.locator('svg[viewBox="0 0 256 256"]')).toBeVisible();
    await page.waitForURL(/\/$/, { timeout: 15_000 });
  });
});
```

Design notes:

- `completeSurvey` is a module-level helper so both the existing happy-path test and the new inactivity test share the exact same walking logic. If the Question DOM changes, only one place to update.
- No `page.goto('/main')` or `page.goto('/ticket')` shortcuts — every subscreen entry is via clicking, matching real user behavior.
- The `/ticket` subscreen's inactivity coverage is validated implicitly by test 2: when the user stops interacting at `/ticket`, the spinner auto-advances and then `/ticketdisplay`'s inactivity returns them home. This IS the safety-net behavior — an isolated "wait at /ticket for 6s" test would never happen in real product usage because the spinner always fires first.

- [ ] **Step 2: Run all three tests**

```bash
npm run test:e2e
```

Expected: all three tests pass. Total wall time roughly:

- Happy path: ~15s
- `/main` inactivity (fake clock): ~2s (fake clock is instant)
- Full-walk inactivity: ~20-25s (survey walk + ~6s wait for /ticketdisplay inactivity)

Total run ~40-60s plus the ~60s initial build.

If the fake-clock test fails with "expected `/$/` but got `/main`", check that `page.clock.install()` was called before `page.goto('/')` — order matters. If `page.clock.fastForward` doesn't accept the string arg `'60s'` on your Playwright version, use `60000` instead.

- [ ] **Step 3: Commit**

```bash
git add e2e/happy-path.spec.js
git commit -m "test(e2e): inactivity returns user to pull screen from each subscreen"
```

---

## Task 7: Add GitHub Actions workflow

**Files:**
- Create: `.github/workflows/e2e.yml`

- [ ] **Step 1: Create the workflow file**

Full contents. Note: this file goes under `.github/workflows/`, not the repo root:

```yaml
name: E2E

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: 'true'

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload test results on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/e2e.yml
git commit -m "ci(e2e): add scheduled Playwright happy-path workflow"
```

---

## Task 8: Local verification and push

- [ ] **Step 1: Full clean run locally**

```bash
# From repo root
rm -rf playwright-report test-results build
npm run test:e2e
```

Expected: build takes ~30-60s, both webServer entries come up (server on 3002, serve on 3000), Playwright launches Chromium, walks the flow, all assertions pass. Total wall time: ~90-120s.

- [ ] **Step 2: Verify HTML report generated**

```bash
ls playwright-report/index.html
```

Expected: file exists.

- [ ] **Step 3: Push**

```bash
git push
```

Expected: pushes to `feat/dam-urls-migration` (or whatever branch the plan is executed on). CI runs the new workflow — check `gh run watch` to see it pass.

---

## Notes for the executing engineer

- **CRA env vars are compile-time.** Setting `REACT_APP_*` at runtime does not work — they must be present when `react-scripts build` runs. That's why `test:e2e:build` inlines them.
- **The `serve` binary comes from the existing `serve` dep** in `dependencies`. No extra install needed.
- **The bunny animation in Question makes clicks slow.** If it's too slow in CI (>15s per click), you can shorten by finding `BunnyAnimation` timing constants — but check with the user first before changing product code just to speed up tests. The 30s timeout per question step should handle it.
- **If the server takes too long to respond to `/printer-status`** on the first webServer check, Playwright will time out. Bump the server's `timeout: 30_000` up to `60_000` if needed.
- **PR #8 is currently open** on `feat/dam-urls-migration`. Adding this to the same branch bundles it with that PR, which may not be what you want — consider a separate branch (`feat/e2e-happy-path`) if you want independent review.

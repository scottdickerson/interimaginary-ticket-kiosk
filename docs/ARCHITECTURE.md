# How the Ticket Kiosk Works

This document describes the architecture and user flow of the Interimaginary Ticket Kiosk: a React kiosk that guides users through a short survey and then issues a ticket (physical via printer and/or virtual via QR code).

---

## Overview

The kiosk is a two-part system:

1. **React app (UI)** — Runs in the browser (dev: port 3000; production: served statically). Handles all screens, survey, and display of the virtual ticket.
2. **Node/Express API (ticket server)** — Runs on port 3002. Serves ticket data, email/printer config, and (when hardware is present) controls an Arduino relay that triggers a physical ticket printer.

The UI talks to the API over HTTP. When no printer is configured, the app still works and shows only the virtual ticket (QR code) screen.

---

## User Flow

1. **Pull screen (`/`)**  
   Landing screen: “Hello… You can receive a ticket here but first we have to ask you a few questions” with an “OK let’s begin” button.

2. **Survey (`/main`)**  
   User answers **6 random questions** from a fixed set of philosophical/playful questions (e.g. “Is doing nothing doing something?”, “What color is the number seven?”). Questions are chosen once per session (no traveler-type questions in the default setup). User can go back or close to return to the pull screen.

3. **Ticket spinner (`/ticket`)**

   - Subscribes to server-sent events (`GET /events`) for **error state** (button: LOW = error).
   - **If not in error state**:
     - Shows “We’re working on your ticket” then “Here’s your ticket!”
     - Calls API `GET /close` to close the relay (start printing).
     - After 1 second, calls `GET /open` to open the relay (stop printing).
     - Contact email is shown (from `TICKET_EMAIL`).
   - **If in error state** (button pressed):
     - Printing is skipped; after a short delay (~5s), user is redirected to the ticket display screen.

4. **Ticket display (`/ticketdisplay`)**
   - Fetches a random ticket from `GET /ticket`.
   - Shows the **destination name**, a **destination image** (from `src/data/imgs/`), and a **QR code** linking to the ticket URL (from the CSV).
   - Used when there is no printer, or as a follow-up to the spinner when there is one.

**Idle reset:** A global “pull screen” wrapper listens for click/touch. After a route-specific delay with no interaction, the app resets back to the pull screen (`/`). Delays are set in `App.js` (e.g. 45s for main, 50s for spinner, 60s for ticket display).

---

## Frontend (React App)

- **Entry:** `src/index.js` → `App.js` with `BrowserRouter`.
- **Routes** (see `src/constants/constants.js`):
  - `ROUTES.PULLSCREEN` → `/` (pull screen is always mounted; visibility depends on route).
  - `ROUTES.MAINSCREEN` → `/main` → `TicketSurvey`.
  - `ROUTES.TICKETSPINNER` → `/ticket` → `TicketSpinner`.
  - `ROUTES.TICKETDISPLAY` → `/ticketdisplay` → `TicketDisplayScreen`.

**Key components:**

- **TicketPullScreen** — Renders the pull screen content and uses `PullScreen` for reset timer and visibility.
- **PullScreen** — Wrapper that shows children when `isVisible` and resets to home after `resetDelay` ms on any click/touch.
- **TicketSurvey** — Picks 6 random (non–traveler) questions and renders `Survey` → `Question` (with choice renderers).
- **TicketSpinner** — Fetches `/email` and subscribes to `GET /events` for error state. When not in error state, triggers `/close` then `/open` on timers; when in error state (or if SSE never connects), redirects to `/ticketdisplay` after a delay.
- **TicketDisplayScreen** — Fetches `GET /ticket`, then renders **TicketDetails** (destination image + QR code). Images are resolved from `src/data/imgs/` by destination name (e.g. `Hogwarts.png`).

The app assumes the API is at `http://127.0.0.1:3002` (see `TicketSpinner.jsx` and `TicketDisplayScreen.jsx`).

---

## Backend (Node/Express Server)

**File:** `server.js`  
**Port:** 3002  
**Config:** `.env` via `dotenv` (e.g. `TICKET_EMAIL`, `ARDUINO_PRINTER_PORT`, `ARDUINO_ERROR_PORT`).

**Endpoints:**

| Endpoint      | Purpose                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /email`  | Returns `TICKET_EMAIL` (contact for “no ticket?”).                                                                                      |
| `GET /events` | Server-sent events stream. Sends `errorState` events (`data: true` or `data: false`) when the error button state changes (LOW = error). |
| `GET /open`   | Opens the relay (pin 7) — used to stop the printer.                                                                                     |
| `GET /close`  | Closes the relay to start printing. No-op if server is in error state.                                                                  |
| `GET /blink`  | Blinks the relay (e.g. for testing).                                                                                                    |
| `GET /ticket` | Returns a random ticket `{ destinationName, destinationTicketURL }` from the CSV.                                                       |

**Arduino (Johnny-Five):**

- **Printer board** — On `ready`, a `Relay` is attached to pin 7. `close` = printer on, `open` = printer off. Port from `ARDUINO_PRINTER_PORT`.
- **Error board** — Button on pin 2 (pull-up). Press (LOW) sets error state and broadcasts to SSE clients; release (HIGH) clears it. Port from `ARDUINO_ERROR_PORT`. If no error board is connected, the server still runs and error state stays false.

**Ticket data:**  
`src/api/ticketReader.js` reads `src/data/21_12_07_Ticket_URLs - Sheet1.csv` (columns `DESTINATION`, `URL`). The CSV `URL` column stores **paths only** (e.g. `/abame/`, `hogwarts/`). The server builds full ticket URLs using `TICKET_BASE_URL` from env (default `http://interimaginarydepartures.com`). Destination images in `src/data/imgs/` are keyed by destination name (e.g. `Hogwarts.png`).

---

## Environment and Configuration

- **TICKET_EMAIL** — Shown on the spinner screen when printing (“No ticket? Contact your Transcendental Ticket Agent: …”). Also the default recipient for error-alert emails.
- **TICKET_EMAIL_PASSWORD** — Gmail App Password for `interimaginarydeparturesticket@gmail.com`. When set, the server sends an email from that address when the error button is pressed. Use a [Gmail App Password](https://support.google.com/accounts/answer/185833) (requires 2-Step Verification). Leave empty to disable error emails.
- **TICKET_ALERT_EMAIL** — (Optional) Recipient for error-alert emails. Defaults to `TICKET_EMAIL` if not set.
- **ARDUINO_PRINTER_PORT** — COM port for the Arduino that drives the ticket printer relay (e.g. `COM3` on Windows, `/dev/ttyUSB0` on Linux). Leave empty to auto-detect.
- **ARDUINO_ERROR_PORT** — COM port for the Arduino used for error/normal input (button). Button LOW = error state; server broadcasts to SSE and skips printing. Also used by `scripts/test-button.js`. Leave empty to auto-detect.
- **TICKET_BASE_URL** — Base URL for ticket QR codes (e.g. `http://interimaginarydepartures.com`). The CSV stores paths only; the server concatenates this base with the path. No trailing slash.
- **REACT_APP_TICKET_BASE_URL** — Same base URL for the **client**; used only for the fallback default ticket when the server is unreachable. Set when building the React app so the fallback QR code uses the correct domain.

---

## Deployment Notes

- **Local:** `yarn start` (UI) and `node server.js` (API). UI calls `127.0.0.1:3002`; run both for full flow.
- **Docker:** Build serves the static React build; the container does not run the Node server or Arduino. Suitable for UI-only or environments where the API runs elsewhere.
- **Heroku:** Static app deploy (see README); again, the Express/Arduino server is separate and must be run where hardware/local API is needed.

For full kiosk behavior (physical + virtual ticket), the React app and the Node server must both be running, with the server able to reach the printer and (optionally) error-button Arduinos.

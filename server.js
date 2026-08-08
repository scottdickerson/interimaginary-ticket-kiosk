const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { provideRandomTicket, provideTicketForDestination } = require('./src/api/ticketReader.js');

var five = require('johnny-five');

/**
 * This server interacts with the Arduino board to control the printer and light.
 * It also provides an SSE endpoint to broadcast the printer status to the client.
 * The client is a React app that is served from the `dist` directory.
 * The server is served from the `server.js` file.
 * The server is served from the `server.js` file.
 *
 * Wiring:
 *
 * - PRINTER_ERROR_BUTTON_PIN: Pin 10 is wired to the momentary contact closure / printer error button
 * - LIGHT_PIN: Pin 8 is the ERROR indicator relay to show the light when the printer is in error mode
 * - RELAY_PIN: Pin 7 is wired to the printer relay to print the ticket once the ticket screen is reached
 */

// Pin wired to the momentary contact closure / printer error button
const PRINTER_ERROR_BUTTON_PIN = 10;
// Pin wired to the feedback indicator relay (light)
const LIGHT_PIN = 8;
// Pin wired to the printer relay to print the ticket
const PRINTER_RELAY_PIN = 7;

// initialize the arduino
const board = new five.Board();
let PrinterSwitch;
let LightRelay;
let printRelayOpenTimer;
let flashLightTimer;

const TICKET_PRINT_HOLD_MS = Number.parseInt(process.env.TICKET_PRINT_HOLD_MS, 10) || 3000;

function flashLight(durationMs = 500) {
  clearTimeout(flashLightTimer);
  LightRelay?.close();
  flashLightTimer = setTimeout(() => LightRelay?.open(), durationMs);
}

// SSE state — true means printer is OK, false means error detected
let printerOk = process.env.TICKET_PRINTER !== 'false';
let sseClients = [];

function removeSseClient(res) {
  sseClients = sseClients.filter(c => c !== res);
}

function broadcastPrinterStatus() {
  const payload = `data: ${JSON.stringify({ printerOk })}\n\n`;
  const dead = [];
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (e) {
      dead.push(client);
    }
  });
  if (dead.length) {
    sseClients = sseClients.filter(c => !dead.includes(c));
  }
}

board.on('fail', (event) => {
  console.error('board failed to initialize', event);
  printerOk = false;
  broadcastPrinterStatus();
  LightRelay?.close();
});

// wait for the board to initialize and then setup the printerswitch
board.on('ready', () => {
  console.log('board is ready!');
  PrinterSwitch = new five.Relay(PRINTER_RELAY_PIN);
  LightRelay = new five.Relay(LIGHT_PIN);
  // Default to not printing until the app explicitly closes the relay
  PrinterSwitch.open();

  const printerErrorButton = new five.Button({ pin: PRINTER_ERROR_BUTTON_PIN, isPullup: true });

  // Set initial state from current button reading (pressed = error = not ok)
  printerOk = !printerErrorButton.isPressed;
  console.log(`initial printer status: ${printerOk ? 'ok' : 'error (button pressed)'}`);
  // Push the real state to any clients that connected before the board was ready
  broadcastPrinterStatus();

  printerErrorButton.on('press', () => {
    console.log('Printer error button pressed — switching to non-printing mode');
    printerOk = false;
    broadcastPrinterStatus();
    LightRelay?.close();
  });
  printerErrorButton.on('release', () => {
    console.log('Printer error button released — switching to printing mode');
    printerOk = true;
    broadcastPrinterStatus();
    LightRelay?.open();
  });
});
const app = express();

const port = 3002;
app.use(cors());

app.get('/docs/arduino-breadboard-wiring.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'arduino-breadboard-wiring.png'));
});

app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ticket kiosk API</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 52rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    h2 { font-size: 1rem; margin-top: 2rem; }
    ul { padding-left: 1.25rem; }
    li { margin: 0.35rem 0; }
    code { background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
    .note { color: #64748b; font-size: 0.9rem; }
    .wiring img { display: block; width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
  </style>
</head>
<body>
  <h1>Ticket kiosk API (port ${port})</h1>
  <p class="note">GET endpoints — open in this browser tab.</p>
  <ul>
    <li><a href="/email"><code>/email</code></a> — ticket agent email</li>
    <li><a href="/printer-status"><code>/printer-status</code></a> — printer OK JSON</li>
    <li><a href="/printer-status-stream"><code>/printer-status-stream</code></a> — SSE stream of printer status</li>
    <li><a href="/ticket"><code>/ticket</code></a> — random ticket destination</li>
    <li><a href="/ticket/Hogwarts"><code>/ticket/:destination</code></a> — example: Hogwarts (try other names from CSV)</li>
    <li><a href="/printTicket"><code>/printTicket</code></a> — close print relay (hold then open)</li>
    <li><a href="/open"><code>/open</code></a> — open print relay immediately</li>
    <li><a href="/light"><code>/light</code></a> — flash error light</li>
    <li><a href="/blink"><code>/blink</code></a> — blink print relay</li>
  </ul>
  <h2>Arduino breadboard wiring</h2>
  <p class="note">D7 print LED, D8 error light, D10 error button, POWER GND to horizontal breadboard rail.</p>
  <figure class="wiring">
    <img src="/docs/arduino-breadboard-wiring.png" alt="Arduino UNO breadboard wiring diagram" />
  </figure>
</body>
</html>`);
});

app.get('/email', (req, res) => {
  res.status(200);
  console.log('sending email', process.env.TICKET_EMAIL);
  res.send(process.env.TICKET_EMAIL);
});

app.get('/open', (req, res) => {
  clearTimeout(printRelayOpenTimer);
  console.log('ticket finished printing!');
  PrinterSwitch?.open();
  res.end('finish printing');
});

app.get('/printTicket', (req, res) => {
  clearTimeout(printRelayOpenTimer);
  console.log('print ticket cycle started');
  PrinterSwitch?.close();
  res.end('print ticket');

  // Always release the relay after a hold, even if the client disconnects
  printRelayOpenTimer = setTimeout(() => {
    console.log(`opening print relay after ${TICKET_PRINT_HOLD_MS}ms`);
    PrinterSwitch?.open();
  }, TICKET_PRINT_HOLD_MS);
});

app.get('/blink', (req, res) => {
  res.end('blinking onboard LED');
  PrinterSwitch?.blink();
});

app.get('/light', (req, res) => {
  flashLight();
  res.end('light flashed');
});

app.get('/printer-status', (req, res) => {
  res.json({ printerOk });
});

app.get('/printer-status-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state immediately so the client knows on connect
  try {
    res.write(`data: ${JSON.stringify({ printerOk })}\n\n`);
  } catch (e) {
    return;
  }

  sseClients.push(res);
  const onEnd = () => removeSseClient(res);
  req.on('close', onEnd);
  req.on('error', onEnd);
  res.on('error', onEnd);
  res.on('close', onEnd);
});

app.get('/ticket', async (req, res, next) => {
  try {
    const ticketDestination = await provideRandomTicket();
    console.log('returning random ticket', ticketDestination);
    res.status(200);
    res.json(ticketDestination);
  } catch (e) {
    console.error('error getting random ticket', e);
    next(e);
  }
});

app.get('/ticket/:destination', async (req, res, next) => {
  try {
    const ticket = await provideTicketForDestination(req.params.destination);
    if (!ticket) {
      res.status(404).json({ error: `no ticket for destination "${req.params.destination}"` });
      return;
    }
    console.log('returning ticket for destination', ticket);
    res.status(200).json(ticket);
  } catch (e) {
    console.error('error getting ticket for destination', e);
    next(e);
  }
});

// Handle 404 - Keep this as a last route
app.use(function (req, res, next) {
  res.status(404);
  res.send('404: File Not Found');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

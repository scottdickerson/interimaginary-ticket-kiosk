const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { provideRandomTicket } = require('./src/api/ticketReader.js');

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
 * - PRINTER_ERROR_BUTTON_PIN: Pin 2 is wired to the momentary contact closure / printer error button
 * - LIGHT_PIN: Pin 8 is the ERROR indicator relay to show the light when the printer is in error mode
 * - RELAY_PIN: Pin 7 is wired to the printer relay to print the ticket once the ticket screen is reached
 */

// Pin wired to the momentary contact closure / printer error button
const PRINTER_ERROR_BUTTON_PIN = 2;
// Pin wired to the feedback indicator relay (light)
const LIGHT_PIN = 8;

// initialize the arduino
const board = new five.Board();
let PrinterSwitch;
let LightRelay;
let printRelayOpenTimer;

const TICKET_PRINT_HOLD_MS = Number.parseInt(process.env.TICKET_PRINT_HOLD_MS, 10) || 3000;

function flashLight(durationMs = 500) {
  LightRelay?.close();
  setTimeout(() => LightRelay?.open(), durationMs);
}

// SSE state — true means printer is OK, false means error detected
let printerOk = process.env.TICKET_PRINTER !== 'false';
let sseClients = [];

function broadcastPrinterStatus() {
  const payload = `data: ${JSON.stringify({ printerOk })}\n\n`;
  sseClients.forEach(client => client.write(payload));
}

// wait for the board to initialize and then setup the printerswitch
board.on('ready', () => {
  console.log('board is ready!');
  PrinterSwitch = new five.Relay(7);
  LightRelay = new five.Relay(LIGHT_PIN);
  // Default to not printing until the app explicitly closes the relay
  PrinterSwitch.open();

  const printerErrorButton = new five.Button({ pin: PRINTER_ERROR_BUTTON_PIN, isPullup: true });
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

app.get('/printer-status-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state immediately so the client knows on connect
  res.write(`data: ${JSON.stringify({ printerOk })}\n\n`);

  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
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

// Handle 404 - Keep this as a last route
app.use(function (req, res, next) {
  res.status(404);
  res.send('404: File Not Found');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

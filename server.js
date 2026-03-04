const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { provideRandomTicket } = require('./src/api/ticketReader.js');

var five = require('johnny-five');

const ERROR_FROM_EMAIL = 'interimaginarydeparturesticket@gmail.com';
const errorAlertTo =
  process.env.TICKET_ALERT_EMAIL?.trim() || process.env.TICKET_EMAIL?.trim() || '';

function sendErrorAlertEmail() {
  const password = process.env.TICKET_EMAIL_PASSWORD?.trim();
  if (!password || !errorAlertTo) {
    console.log('skip error email: TICKET_EMAIL_PASSWORD or recipient not set');
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ERROR_FROM_EMAIL,
      pass: password,
    },
  });
  transporter
    .sendMail({
      from: ERROR_FROM_EMAIL,
      to: errorAlertTo,
      subject: 'Ticket kiosk error state',
      text: 'The ticket kiosk error button was pressed. Printing is disabled until the button is released.',
    })
    .then(() => console.log('Error alert email sent to', errorAlertTo))
    .catch(err => console.error('Error sending alert email:', err.message));
}

// Error state from button (LOW = error). Broadcast to SSE clients when it changes.
let errorState = false;
// Printer board connected (false if can't connect to COM port).
let printerAvailable = false;
const sseClients = [];

function broadcastErrorState() {
  const payload = String(errorState);
  sseClients.forEach(res => {
    try {
      res.write(`event: errorState\ndata: ${payload}\n\n`);
    } catch (e) {
      // client may have disconnected
    }
  });
}

function broadcastPrinterAvailable() {
  const payload = String(printerAvailable);
  sseClients.forEach(res => {
    try {
      res.write(`event: printerAvailable\ndata: ${payload}\n\n`);
    } catch (e) {
      // client may have disconnected
    }
  });
}

// initialize the arduino for the ticket printer relay
const printerPort = process.env.ARDUINO_PRINTER_PORT?.trim() || undefined;
const board = new five.Board(printerPort ? { port: printerPort } : {});
let PrinterSwitch;

board.on('ready', () => {
  console.log('printer board is ready!');
  PrinterSwitch = new five.Relay(7);
  printerAvailable = true;
  broadcastPrinterAvailable();
});

board.on('error', err => {
  console.error('printer board not available:', err.message);
  printerAvailable = false;
  broadcastPrinterAvailable();
});

// initialize the arduino for error-state button (LOW = error, HIGH = normal)
const errorPort = process.env.ARDUINO_ERROR_PORT?.trim() || undefined;
const errorBoard = new five.Board(errorPort ? { port: errorPort } : {});

errorBoard.on('ready', () => {
  console.log('error board is ready!');
  const button = new five.Button({ pin: 2, pullup: true });
  button.on('press', () => {
    errorState = true;
    console.log('error state: true (button pressed)');
    broadcastErrorState();
    sendErrorAlertEmail();
  });
  button.on('release', () => {
    errorState = false;
    console.log('error state: false (button released)');
    broadcastErrorState();
  });
});

errorBoard.on('error', err => {
  console.error('error board not available:', err.message);
});

const app = express();

const port = 3002;
app.use(cors());

app.get('/email', (req, res) => {
  res.status(200);
  console.log('sending email', process.env.TICKET_EMAIL);
  res.send(process.env.TICKET_EMAIL);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`event: errorState\ndata: ${errorState}\n\n`);
  res.write(`event: printerAvailable\ndata: ${printerAvailable}\n\n`);
  sseClients.push(res);
  req.on('close', () => {
    const i = sseClients.indexOf(res);
    if (i !== -1) sseClients.splice(i, 1);
  });
});

app.get('/open', (req, res) => {
  console.log('ticket finished printing!');
  res.end('relay opened');
  PrinterSwitch?.open();
});

app.get('/close', (req, res) => {
  if (errorState) {
    console.log('in error state, skipping print');
    return res.end('relay not closed (error state)');
  }
  if (!printerAvailable) {
    console.log('printer not available, skipping print');
    return res.end('relay not closed (printer disabled)');
  }
  console.log('ticket printing!');
  PrinterSwitch?.close();
  res.end('relay closed');
});

app.get('/blink', (req, res) => {
  res.end('blinking onboard LED');
  PrinterSwitch?.blink();
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

/**
 * Standalone test: read a button with Johnny-Five.
 * LOW  → error state
 * HIGH → normal state
 *
 * On button press, sends an error alert email (same as server) if TICKET_EMAIL_PASSWORD is set.
 *
 * Requires: Arduino with StandardFirmata uploaded.
 * Wiring: button between digital pin 2 and GND (internal pull-up).
 *
 * Set ARDUINO_ERROR_PORT in .env (e.g. COM4) to use a specific board.
 * Run: node scripts/test-button.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const { Board, Button } = require('johnny-five');

const BUTTON_PIN = 2;
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
    auth: { user: ERROR_FROM_EMAIL, pass: password },
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

const errorPort = process.env.ARDUINO_ERROR_PORT?.trim() || undefined;
const board = new Board(Object.assign({ repl: false }, errorPort ? { port: errorPort } : {}));

board.on('ready', () => {
  const button = new Button({
    pin: BUTTON_PIN,
    pullup: true,
  });

  function stateFromDown(isDown) {
    return isDown ? 'ERROR' : 'NORMAL'; // LOW (pressed) = ERROR, HIGH (released) = NORMAL
  }

  let currentState = null;

  function setState(name) {
    if (name !== currentState) {
      currentState = name;
      console.log(`[${new Date().toISOString()}] State: ${currentState}`);
    }
  }

  setState(stateFromDown(button.isDown));

  button.on('press', () => {
    setState('ERROR');
    sendErrorAlertEmail();
  });
  button.on('release', () => setState('NORMAL'));

  console.log(
    `Button test running. Pin ${BUTTON_PIN}: LOW = ERROR, HIGH = NORMAL. Press Ctrl+C to exit.`
  );
});

board.on('error', err => {
  console.error('Board error:', err.message);
  process.exitCode = 1;
});

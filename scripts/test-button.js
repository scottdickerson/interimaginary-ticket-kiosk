/**
 * Standalone test: read a button with Johnny-Five.
 * LOW  → error state
 * HIGH → normal state
 *
 * Requires: Arduino with StandardFirmata uploaded.
 * Wiring: button between digital pin 2 and GND (internal pull-up).
 *
 * Set ARDUINO_ERROR_PORT in .env (e.g. COM4) to use a specific board.
 * Run: node scripts/test-button.js
 */

require('dotenv').config();
const { Board, Button } = require('johnny-five');

const BUTTON_PIN = 2;

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

  button.on('press', () => setState('ERROR'));
  button.on('release', () => setState('NORMAL'));

  console.log(
    `Button test running. Pin ${BUTTON_PIN}: LOW = ERROR, HIGH = NORMAL. Press Ctrl+C to exit.`
  );
});

board.on('error', err => {
  console.error('Board error:', err.message);
  process.exitCode = 1;
});

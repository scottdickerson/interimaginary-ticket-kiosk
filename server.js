const express = require('express');

var five = require('johnny-five');

// initialize the arduino
const board = new five.Board();
let PrinterSwitch;

// wait for the board to initialize and then setup the printerswitch
board.on('ready', () => {
  console.log('board is ready!');
  PrinterSwitch = new five.Relay(14);
});
const app = express();

const port = 3002;

app.get('/open', (req, res) => {
  res.end('relay opened');
  PrinterSwitch.open();
});

app.get('/close', (req, res) => {
  PrinterSwitch.close();
  res.end('relay closed');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

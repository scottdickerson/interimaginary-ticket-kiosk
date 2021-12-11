const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { provideRandomTicket } = require('./src/api/ticketReader.js');

var five = require('johnny-five');

// initialize the arduino
const board = new five.Board();
let PrinterSwitch;

// wait for the board to initialize and then setup the printerswitch
board.on('ready', () => {
  console.log('board is ready!');
  PrinterSwitch = new five.Relay(7);
  // PrinterSwitch = new five.Led(13);
  // PrinterSwitch = new five.Pin(7);
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
  res.end('relay opened');
  PrinterSwitch?.open();
  // PrinterSwitch.low();
});

app.get('/close', (req, res) => {
  PrinterSwitch?.close();
  // PrinterSwitch.high();
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

// import csv from 'csvtojson';
// import path from 'path';
// import shuffle from 'lodash/shuffle';
const csv = require('csvtojson');
const path = require('path');

const shuffle = require('lodash/shuffle');

const TICKET_URL_FILE_NAME = '21_12_07_Ticket_URLs - Sheet1.csv';

const DEFAULT_TICKET_BASE_URL = 'http://interimaginarydepartures.com';

function getTicketBaseUrl() {
  const base = process.env.TICKET_BASE_URL?.trim();
  return base ? base.replace(/\/$/, '') : DEFAULT_TICKET_BASE_URL;
}

const loadTicketFile = async () => {
  const ticketFilePath = path.join(__dirname, '..', 'data', TICKET_URL_FILE_NAME);
  const ticketURLJSON = await csv().fromFile(ticketFilePath);
  return ticketURLJSON;
};

const provideRandomTicket = async () => {
  const ticketURLJSON = await loadTicketFile();
  console.log('ticket json', ticketURLJSON);
  const randomDestination = shuffle(ticketURLJSON).pop();
  console.log('ticket destination', randomDestination);
  const baseUrl = getTicketBaseUrl();
  const pathPart = randomDestination.URL.startsWith('/')
    ? randomDestination.URL
    : `/${randomDestination.URL}`;
  const destinationTicketURL = `${baseUrl}${pathPart}`;
  return {
    destinationName: randomDestination.DESTINATION,
    destinationTicketURL,
  };
};

module.exports = {
  provideRandomTicket,
  loadTicketFile,
  TICKET_URL_FILE_NAME,
};

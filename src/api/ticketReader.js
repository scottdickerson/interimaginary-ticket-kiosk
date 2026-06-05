// import csv from 'csvtojson';
// import path from 'path';
// import shuffle from 'lodash/shuffle';
const csv = require('csvtojson');
const path = require('path');

const shuffle = require('lodash/shuffle');

const TICKET_URL_FILE_NAME = '21_12_07_Ticket_URLs - Sheet1.csv';

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
  return {
    destinationName: randomDestination.DESTINATION,
    destinationTicketURL: randomDestination.URL,
  };
};

module.exports = {
  provideRandomTicket,
  loadTicketFile,
  TICKET_URL_FILE_NAME,
};

// import csv from 'csvtojson';
// import path from 'path';
// import shuffle from 'lodash/shuffle';
const csv = require('csvtojson');
const path = require('path');

const shuffle = require('lodash/shuffle');

const TICKET_URL_FILE_NAME = 'DAM_URLs.csv';
const DOWNLOAD_URL_COLUMN = 'Download Link=Direct Download';

const loadTicketFile = async () => {
  const ticketFilePath = path.join(__dirname, '..', 'data', TICKET_URL_FILE_NAME);
  const ticketURLJSON = await csv().fromFile(ticketFilePath);
  return ticketURLJSON;
};

const rowToTicket = row => ({
  destinationName: row.Filename.replace(/\.pdf$/i, ''),
  destinationTicketURL: row[DOWNLOAD_URL_COLUMN],
});

const provideRandomTicket = async () => {
  const ticketURLJSON = await loadTicketFile();
  console.log('ticket json', ticketURLJSON);
  const randomDestination = shuffle(ticketURLJSON).pop();
  console.log('ticket destination', randomDestination);
  return rowToTicket(randomDestination);
};

const provideTicketForDestination = async destination => {
  const ticketURLJSON = await loadTicketFile();
  const match = ticketURLJSON.find(
    row => row.Filename.replace(/\.pdf$/i, '') === destination,
  );
  return match ? rowToTicket(match) : null;
};

module.exports = {
  provideRandomTicket,
  provideTicketForDestination,
  loadTicketFile,
  TICKET_URL_FILE_NAME,
};

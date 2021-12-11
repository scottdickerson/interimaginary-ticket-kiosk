// import csv from 'csvtojson';
// import path from 'path';
// import shuffle from 'lodash/shuffle';
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');

const shuffle = require('lodash/shuffle');
const axios = require('axios');

const TICKET_URL_FILE_NAME = '21_12_07_Ticket_URLs - Sheet1.csv';

const downloadAllTicketImages = async () => {
  const ticketURLJSON = await loadTicketFile();
  ticketURLJSON.forEach(ticket => {});
};

const downloadAndSaveTicket = async (destinationName, directoryToSave) => {
  const urlOfTicket =
    'http://interimaginarydepartures.com/wp-content/uploads/2021/12/Grovers-Corners-1024x512.jpg';
  const ticketImageFileResponse = await axios({
    url: urlOfTicket,
    method: 'GET',
    responseType: 'stream',
  });
  const w = ticketImageFileResponse.data.pipe(
    fs.createWriteStream(path.join(directoryToSave, destinationName))
  );
  w.on('finish', () => {
    console.log('Successfully downloaded file!', destinationName);
  });
};

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
};

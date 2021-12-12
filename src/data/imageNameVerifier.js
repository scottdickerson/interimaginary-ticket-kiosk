const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const { TICKET_URL_FILE_NAME } = require('../api/ticketReader');

const verifyImageNames = async () => {
  const tickets = await csv().fromFile(path.join(__dirname, TICKET_URL_FILE_NAME));

  const fileNames = fs.readdirSync(path.join(__dirname, 'imgs'));
  tickets.forEach(ticket => {
    if (!fileNames.includes(`${ticket.DESTINATION}.png`)) {
      console.error('ticket destination image missing', ticket.DESTINATION);
    }
  });
};

verifyImageNames();

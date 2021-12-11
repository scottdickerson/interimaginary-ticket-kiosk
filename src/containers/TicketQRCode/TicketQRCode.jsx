import axios from 'axios';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

const SERVER_PORT = 3002;
const SERVER_HOST = '127.0.0.1';

const TicketQRCode = () => {
  const [ticketURL, setTicketURL] = useState();
  useEffect(() => {
    const loadTicketURL = async () => {
      try {
        const randomTicketResponse = await axios({
          url: `http://${SERVER_HOST}:${SERVER_PORT}/ticket`,
          method: 'GET',
          responseType: 'json',
        });
        if (randomTicketResponse?.data) {
          const ticketURL = randomTicketResponse?.data?.destinationTicketURL;
          console.log('Loaded ticket URL: ', ticketURL);
          setTicketURL(ticketURL);
        } else {
          console.error('Could not find ticket URL');
          setTicketURL('http://interimaginarydepartures.com/abame/');
        }
      } catch (e) {
        console.error('Error loading ticket URL', e);
        setTicketURL('http://interimaginarydepartures.com/abame/');
      }
    };

    if (!ticketURL) {
      loadTicketURL();
    }
  }, [ticketURL]);

  return ticketURL ? <QRCode value={ticketURL} /> : null;
};

export default TicketQRCode;

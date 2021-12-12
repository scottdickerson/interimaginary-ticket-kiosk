import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import TicketDisplayScreen from '../../components/TicketDisplayScreen/TicketDisplayScreen';
import { withRouter } from 'react-router';
import { ROUTES } from '../../constants/constants';

const SERVER_PORT = 3002;
const SERVER_HOST = '127.0.0.1';

const TicketQRCode = ({ history }) => {
  const [ticketURL, setTicketURL] = useState();

  // respond to the header events
  const handleBack = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleClose = useCallback(() => {
    history.push(ROUTES.PULLSCREEN);
  }, [history]);

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

  return ticketURL ? (
    <TicketDisplayScreen ticketURL={ticketURL} onBack={handleBack} onClose={handleClose} />
  ) : null;
};

export default withRouter(TicketQRCode);

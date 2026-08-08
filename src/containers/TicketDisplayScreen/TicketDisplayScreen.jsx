import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import TicketDetails from '../../components/TicketDetails/TicketDetails';
import { withRouter } from 'react-router';
import { ROUTES } from '../../constants/constants';

const SERVER_PORT = 3002;
const SERVER_HOST = '127.0.0.1';

const TicketQRCode = ({ history }) => {
  const [ticketDetails, setTicketDetails] = useState();

  // respond to the header events
  const handleBack = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleClose = useCallback(() => {
    history.push(ROUTES.PULLSCREEN);
  }, [history]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadTicketDetails = async () => {
      try {
        const randomTicketResponse = await axios({
          url: `http://${SERVER_HOST}:${SERVER_PORT}/ticket`,
          method: 'GET',
          responseType: 'json',
          signal: controller.signal,
        });
        if (cancelled) return;
        if (randomTicketResponse?.data) {
          const ticketDetails = randomTicketResponse?.data;
          console.log('Loaded ticket Details: ', ticketDetails);
          setTicketDetails(ticketDetails);
        } else {
          console.error('Could not find ticket Details');
          setTicketDetails({
            // set a default in case we can't access the server
            destinationName: 'Hogwarts',
            destinationTicketURL:
              'https://austin.widen.net/view/pdf/7ffzei9dkg/Hogwarts.pdf?t.download=true&u=6bapu1',
          });
        }
      } catch (e) {
        if (cancelled || axios.isCancel(e) || e.name === 'AbortError' || e.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Error loading ticket Details', e);
        setTicketDetails({
          // set a default in case we can't access the server
          destinationName: 'Hogwarts',
          destinationTicketURL: 'http://interimaginarydepartures.com/hogwarts/',
        });
      }
    };
    loadTicketDetails();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return ticketDetails ? (
    <TicketDetails
      ticketURL={ticketDetails.destinationTicketURL}
      ticketDestination={ticketDetails.destinationName}
      onBack={handleBack}
      onClose={handleClose}
    />
  ) : null;
};

export default withRouter(TicketQRCode);

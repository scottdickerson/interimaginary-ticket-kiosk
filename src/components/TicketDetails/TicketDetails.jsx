import QRCode from 'react-qr-code';
import { useEffect, useMemo } from 'react';
import Header from '../Header/Header';
import styles from './TicketDetails.module.css';

const cache = {};

function importAll(r) {
  r.keys().forEach(key => (cache[key] = r(key)));
}

importAll(require.context('../../data/imgs', false, /^.*\.png$/, 'sync'));

console.log('dynamic image import cache', cache);

const MOBILE_TICKET_BASE_URL =
  process.env.REACT_APP_MOBILE_TICKET_BASE_URL || 'https://interimaginary-ticket-server.vercel.app';

const TicketDetails = ({ ticketURL, ticketDestination, onBack, onClose }) => {
  const ticketImageName = `./${ticketDestination}.png`;

  const mobileTicketUrl = useMemo(() => {
    const encodedDestination = encodeURIComponent(ticketDestination);
    const base = MOBILE_TICKET_BASE_URL.replace(/\/$/, '');
    return `${base}/tickets/${encodedDestination}.pdf`;
  }, [ticketDestination]);

  // log when the ticket has changed
  useEffect(() => {
    console.log('ticket image', ticketImageName);
  }, [ticketImageName]);
  return (
    <>
      <div className={styles.ticketDisplayScreen}>
        <Header
        /**
         * onBack={onBack}
         * onClose={onClose}
         */
        />
        <h2 className={styles.heading}>Here’s your virtual ticket!</h2>
        <img
          className={styles.ticketImage}
          src={cache[ticketImageName]?.default}
          alt={`Ticket for ${ticketDestination}`}
        />
        <span className={styles.instructions}>
          If you’d like this printable ticket on your phone, scan this QR code
        </span>
        <QRCode size={75} value={mobileTicketUrl} />
      </div>
    </>
  );
};

export default TicketDetails;

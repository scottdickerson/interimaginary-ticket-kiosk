import QRCode from 'react-qr-code';
import { useEffect } from 'react';
import Header from '../Header/Header';
import styles from './TicketDetails.module.css';

const cache = {};

function importAll(r) {
  r.keys().forEach(key => (cache[key] = r(key)));
}

importAll(require.context('../../data/imgs', false, /^.*\.png$/, 'sync'));

console.log('dynamic image import cache', cache);

const TicketDetails = ({ ticketURL, ticketDestination, onBack, onClose }) => {
  const ticketImageName = `./${ticketDestination}.png`;

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
        <QRCode size={75} value={ticketURL} />
      </div>
    </>
  );
};

export default TicketDetails;

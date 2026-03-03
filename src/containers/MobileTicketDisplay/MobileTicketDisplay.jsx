import React, { useMemo } from 'react';
import { withRouter } from 'react-router';
import styles from './MobileTicketDisplay.module.css';

const cache = {};

function importAll(r) {
  r.keys().forEach(key => {
    cache[key] = r(key);
  });
}

importAll(require.context('../../data/imgs', false, /^.*\.png$/, 'sync'));

const MobileTicketDisplay = ({ location }) => {
  const destination = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('destination');
  }, [location.search]);

  if (!destination) {
    return (
      <div className={styles.mobileTicketDisplay}>
        <div className={styles.message}>No ticket destination specified.</div>
      </div>
    );
  }

  const ticketImageName = `./${destination}.png`;
  const ticketSrc = cache[ticketImageName]?.default;

  return (
    <div className={styles.mobileTicketDisplay}>
      {ticketSrc ? (
        <img
          className={styles.ticketImage}
          src={ticketSrc}
          alt={`Ticket for ${destination}`}
        />
      ) : (
        <div className={styles.message}>Ticket image not found.</div>
      )}
    </div>
  );
};

export default withRouter(MobileTicketDisplay);


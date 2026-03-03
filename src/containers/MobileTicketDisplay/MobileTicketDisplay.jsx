import React, { useMemo, useEffect } from 'react';
import { withRouter } from 'react-router';
import styles from './MobileTicketDisplay.module.css';

const MobileTicketDisplay = ({ location }) => {
  const destination = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('destination');
  }, [location.search]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo(0, 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  if (!destination) {
    return (
      <div className={styles.mobileTicketDisplay}>
        <div className={styles.mobileTicketDisplayInner}>
          <div className={styles.message}>No ticket destination specified.</div>
        </div>
      </div>
    );
  }

  const imageSrc = `/tickets/${encodeURIComponent(destination)}.png`;

  return (
    <div className={styles.mobileTicketDisplay}>
      <div className={styles.mobileTicketDisplayInner}>
        <img
          className={styles.ticketImage}
          src={imageSrc}
          alt={`Ticket for ${destination}`}
        />
      </div>
    </div>
  );
};

export default withRouter(MobileTicketDisplay);


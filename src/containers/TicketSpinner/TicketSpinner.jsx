import React, { useEffect } from 'react';
import styles from './TicketSpinner.module.css';
import { ROUTES } from '../../constants/constants';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';

const TicketSpinner = ({ history }) => {
  useEffect(() => {
    const timeout = setTimeout(() => history.push(ROUTES.PULLSCREEN), 6000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={styles.ticketSpinner}>
      <img width="350px" height="350px" src={bunnies} alt="Spinning bunnies" />
      <h2 className={styles.ticketText}>Here&prime;s your ticket!</h2>
    </div>
  );
};

export default withRouter(TicketSpinner);

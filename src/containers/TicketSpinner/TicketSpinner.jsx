import React, { useEffect, useState } from 'react';
import styles from './TicketSpinner.module.css';
import { ROUTES } from '../../constants/constants';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';
import classNames from 'classnames';

const TEXT_DELAY = 20000;

const TicketSpinner = ({ history }) => {
  const [showText, setShowText] = useState(false);
  // Go back to main screen after some time
  useEffect(() => {
    // TODO: wait until the ticket actually prints, assume ticket prints in 5 seconds
    const timeout = setTimeout(() => history.push(ROUTES.PULLSCREEN), TEXT_DELAY + 5000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // print ticket after some time
  useEffect(() => {
    const printRelayTrigger = setTimeout(() => {
      setShowText(true);
    }, TEXT_DELAY);
    return () => {
      clearTimeout(printRelayTrigger);
    };
  });

  // close the relay
  useEffect(() => {
    const printRelayClose = setTimeout(() => {
      // Only open the print switch for 1 second
    }, TEXT_DELAY + 1000);
    return () => {
      clearTimeout(printRelayClose);
    };
  }, []);
  return (
    <div className={styles.ticketSpinner}>
      <img width="350px" height="350px" src={bunnies} alt="Spinning bunnies" />
      {showText ? (
        <h2 className={classNames(styles.ticketText, styles.blink_me)}>
          Here&prime;s your ticket!
        </h2>
      ) : null}
    </div>
  );
};
export default withRouter(TicketSpinner);

import React, { useEffect, useState } from 'react';
import styles from './TicketSpinner.module.css';
import { ROUTES } from '../../constants/constants';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';
import classNames from 'classnames';

const TEXT_DELAY = 20000;
// const TEXT_DELAY = 5000;

const SERVER_PORT = 3002;

const TicketSpinner = ({ history }) => {
  const [showText, setShowText] = useState(false);
  // const [showErrorText, setShowErrorText] = useState(false);
  // Go back to main screen after some time
  useEffect(() => {
    // TODO: wait until the ticket actually prints, assume ticket prints in 5 seconds
    const timeout = setTimeout(() => history.push(ROUTES.PULLSCREEN), TEXT_DELAY + 5000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // print ticket after some time
  useEffect(() => {
    const printRelayClose = setTimeout(() => {
      setShowText(true);
      // contact the server to close the switch
      fetch(`http://localhost:${SERVER_PORT}/close`, { method: 'GET', mode: 'no-cors' }).catch(
        error => {
          console.log('Error printing ticket', error);
          // setShowErrorText(true);
        }
      );
    }, TEXT_DELAY);
    return () => {
      clearTimeout(printRelayClose);
    };
  });

  // open the relay to stop the ticket printing
  useEffect(() => {
    // Only open the print switch for 1 second
    const printRelayOpen = setTimeout(() => {
      fetch(`http://localhost:${SERVER_PORT}/open`, { method: 'GET', mode: 'no-cors' }).catch(
        error => {
          console.log('Error opening ticket relay', error);
        }
      );
    }, TEXT_DELAY + 1000);
    // contact the server to open the switch

    return () => {
      clearTimeout(printRelayOpen);
    };
  }, []);
  return (
    <div className={styles.ticketSpinner}>
      <img width="350px" height="350px" src={bunnies} alt="Spinning bunnies" />
      {showText ? (
        //&& !showErrorText
        <h2 className={classNames(styles.ticketText, styles.blink_me)}>
          Here&prime;s your ticket!
        </h2>
      ) : null}
      {/* {showErrorText ? (
        <h2 className={classNames(styles.ticketText)}>
          Error printing ticket! Please contact your airport gate agent.
        </h2>
      ) : null} */}
    </div>
  );
};
export default withRouter(TicketSpinner);

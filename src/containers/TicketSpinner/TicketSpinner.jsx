import React, { useEffect, useState } from 'react';
import styles from './TicketSpinner.module.css';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';
import classNames from 'classnames';

const TEXT_DELAY = 20000;
//const TEXT_DELAY = 5000;

const SERVER_PORT = 3002;
const SERVER_HOST = '127.0.0.1';

const TicketSpinner = () => {
  const [showText, setShowText] = useState(false);
  // const [showErrorText, setShowErrorText] = useState(false);

  const [ticketEmail, setTicketEmail] = useState('interimaginary@austintexas.gov');

  // load the email address
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/email`, { method: 'GET' })
      .then(response => {
        // console.log('responseStatus', response.status, response.statusText);
        return response.text();
      })
      .then(email => {
        console.log('got email', email);
        if (email) {
          setTicketEmail(email);
        }
      })
      .catch(error => {
        console.log('Error fetching email', error);
        // setShowErrorText(true);
      });
  }, []);

  // print ticket after some time
  useEffect(() => {
    const printRelayClose = setTimeout(() => {
      setShowText(true);
      // contact the server to close the switch
      fetch(`http://${SERVER_HOST}:${SERVER_PORT}/close`, { method: 'GET', mode: 'no-cors' }).catch(
        error => {
          console.log('Error printing ticket', error);
          // setShowErrorText(true);
        }
      );
    }, TEXT_DELAY);
    return () => {
      clearTimeout(printRelayClose);
    };
  }, []);

  // open the relay to stop the ticket printing
  useEffect(() => {
    // Only open the print switch for 1 second
    const printRelayOpen = setTimeout(() => {
      fetch(`http://${SERVER_HOST}:${SERVER_PORT}/open`, { method: 'GET', mode: 'no-cors' }).catch(
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
        <>
          <h2 className={classNames(styles.ticketText, styles.blink_me)}>
            Here&prime;s your ticket!
          </h2>
          <h3 className={classNames(styles.ticketText)}>
            No ticket? Contact your Transcendental Ticket Agent: {ticketEmail}
          </h3>
        </>
      ) : (
        <h2 className={classNames(styles.waitingForTicketText)}>
          We&prime;re working on your ticket.
        </h2>
      )}
    </div>
  );
};

export default withRouter(TicketSpinner);

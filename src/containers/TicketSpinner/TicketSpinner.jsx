import React, { useEffect, useState } from 'react';
import styles from './TicketSpinner.module.css';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';
import isNil from 'lodash/isNil';
import classNames from 'classnames';
import { ROUTES } from '../../constants/constants';

const TEXT_DELAY = 20000;
//const TEXT_DELAY = 5000;
const SCREEN_TO_TICKETDISPLAY_TIMER = 30000;
// const SCREEN_TO_TICKET_DISPLAY_TIMER = 2000;

const SERVER_PORT = 3002;
const SERVER_HOST = '127.0.0.1';

const TicketSpinner = ({ history }) => {
  const [showText, setShowText] = useState(false);
  // const [showErrorText, setShowErrorText] = useState(false);

  const [ticketEmail, setTicketEmail] = useState('interimaginary@austintexas.gov');
  const [isPrinterConfigured, setIsPrinterConfigured] = useState();

  // load the email address and the ticket printer configuration
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
    // get the ticket printer configuration
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/printerConfiguration`, { method: 'GET' })
      .then(response => {
        // console.log('responseStatus', response.status, response.statusText);
        return response.text();
      })
      .then(printerConfiguration => {
        console.log('got printerConfiguration', printerConfiguration);
        if (printerConfiguration) {
          setIsPrinterConfigured(printerConfiguration === 'true');
        }
      })
      .catch(error => {
        console.log('Error fetching printerConfiguration', error);
        // setShowErrorText(true);
      });
  }, []);

  useEffect(() => {
    // if the printer really isn't configured, we will redirect to the visual ticket page after 30 seconds
    if (!isNil(isPrinterConfigured) && !isPrinterConfigured) {
      const displayRedirectTimer = setTimeout(() => {
        history.push(ROUTES.TICKETDISPLAY);
      }, [SCREEN_TO_TICKETDISPLAY_TIMER]);
      return () => clearTimeout(displayRedirectTimer);
    }
  }, [isPrinterConfigured, history]);

  // print ticket after some time
  useEffect(() => {
    if (isPrinterConfigured) {
      const printRelayClose = setTimeout(() => {
        console.log('Printing the ticket');
        setShowText(true);
        // contact the server to close the switch
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/close`, {
          method: 'GET',
          mode: 'no-cors',
        }).catch(error => {
          console.log('Error printing ticket', error);
          // setShowErrorText(true);
        });
      }, TEXT_DELAY);
      return () => {
        clearTimeout(printRelayClose);
      };
    }
  }, [isPrinterConfigured]);

  // open the relay to stop the ticket printing
  useEffect(() => {
    if (isPrinterConfigured) {
      // Only open the print switch for 1 second
      const printRelayOpen = setTimeout(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/open`, {
          method: 'GET',
          mode: 'no-cors',
        }).catch(error => {
          console.log('Error opening ticket relay', error);
        });
      }, TEXT_DELAY + 1000);
      // contact the server to open the switch

      return () => {
        clearTimeout(printRelayOpen);
      };
    }
  }, [isPrinterConfigured]);

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

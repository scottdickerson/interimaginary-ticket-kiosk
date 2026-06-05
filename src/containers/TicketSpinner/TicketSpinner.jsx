import React, { useEffect, useRef, useState } from 'react';
import styles from './TicketSpinner.module.css';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import { ROUTES, SERVER_HOST, SERVER_PORT } from '../../constants/constants';

const TEXT_DELAY = Number.parseInt(process.env.REACT_APP_TICKET_WORKING_DELAY_MS, 10) || 20000;

const TicketSpinner = ({ history, isPrinterConfigured }) => {
  const isPrinterConfiguredRef = useRef(isPrinterConfigured);
  isPrinterConfiguredRef.current = isPrinterConfigured;

  const [showText, setShowText] = useState(false);
  // const [showErrorText, setShowErrorText] = useState(false);

  const [ticketEmail, setTicketEmail] = useState('interimaginary@austintexas.gov');

  // load email address
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/email`, { method: 'GET' })
      .then(response => response.text())
      .then(email => {
        console.log('got email', email);
        if (email) setTicketEmail(email);
      })
      .catch(error => {
        console.log('Error fetching email', error);
      });
  }, []);

  // If the printer error button is pressed mid-print, fall back to digital ticket
  const prevPrinterConfiguredRef = useRef(isPrinterConfigured);
  useEffect(() => {
    if (prevPrinterConfiguredRef.current === true && !isPrinterConfigured) {
      console.log('Printer error detected during spinner — switching to digital ticket');
      history.push(ROUTES.TICKETDISPLAY);
    }
    prevPrinterConfiguredRef.current = isPrinterConfigured;
  }, [isPrinterConfigured, history]);

  // Server closes the relay, holds, then opens — not handled in the client
  useEffect(() => {
    const printTimer = setTimeout(() => {
      setShowText(true);
      if (isPrinterConfiguredRef.current) {
        console.log('Starting print relay cycle');
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/printTicket`, { method: 'GET', mode: 'no-cors' })
          .then(() => console.log('Print ticket cycle started'))
          .catch(error => {
            console.log('Error starting print ticket cycle — falling back to digital ticket', error);
            history.push(ROUTES.TICKETDISPLAY);
          });
      } else {
        console.log('Printer not configured — skipping print, advancing to ticket display');
        history.push(ROUTES.TICKETDISPLAY);
      }
    }, TEXT_DELAY);

    return () => clearTimeout(printTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

import React, { useEffect, useState } from 'react';
import styles from './TicketSpinner.module.css';
import bunnies from './img/TransparentBunnies.png';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import { ROUTES } from '../../constants/constants';

const TEXT_DELAY = 20000;
//const TEXT_DELAY = 5000;
const SCREEN_TO_TICKETDISPLAY_TIMER = 5000;
// const SCREEN_TO_TICKETDISPLAY_TIMER = 2000;

const SERVER_PORT = 3002;
const SERVER_HOST = '127.0.0.1';

const TicketSpinner = ({ history }) => {
  const [showText, setShowText] = useState(false);

  const [ticketEmail, setTicketEmail] = useState('interimaginary@austintexas.gov');
  const [errorState, setErrorState] = useState(false);
  const [printerAvailable, setPrinterAvailable] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Print only when not in error state and printer board is connected (from server SSE)
  const canPrint = !errorState && printerAvailable;

  // load the email address
  useEffect(() => {
    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/email`, { method: 'GET' })
      .then(response => response.text())
      .then(email => {
        if (email) setTicketEmail(email);
      })
      .catch(error => console.log('Error fetching email', error));
  }, []);

  // subscribe to server-sent events (error state + printer connection)
  useEffect(() => {
    const eventSource = new EventSource(`http://${SERVER_HOST}:${SERVER_PORT}/events`);
    eventSource.addEventListener('errorState', e => {
      setErrorState(e.data === 'true');
      setIsLoaded(true);
    });
    eventSource.addEventListener('printerAvailable', e => {
      setPrinterAvailable(e.data === 'true');
      setIsLoaded(true);
    });
    eventSource.onerror = () => {
      setIsLoaded(true);
    };
    return () => eventSource.close();
  }, []);

  // when can't print (error state or printer disabled), redirect to visual ticket after delay
  useEffect(() => {
    if (isLoaded && !canPrint) {
      const displayRedirectTimer = setTimeout(() => {
        history.push(ROUTES.TICKETDISPLAY);
      }, SCREEN_TO_TICKETDISPLAY_TIMER);
      return () => clearTimeout(displayRedirectTimer);
    }
  }, [isLoaded, canPrint, history]);

  // print ticket after some time (only when not error state and printer connected)
  useEffect(() => {
    if (canPrint) {
      const printRelayClose = setTimeout(() => {
        console.log('Printing the ticket');
        setShowText(true);
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/close`, {
          method: 'GET',
          mode: 'no-cors',
        }).catch(error => console.log('Error printing ticket', error));
      }, TEXT_DELAY);
      return () => clearTimeout(printRelayClose);
    }
  }, [canPrint]);

  // open the relay to stop the ticket printing
  useEffect(() => {
    if (canPrint) {
      const printRelayOpen = setTimeout(() => {
        fetch(`http://${SERVER_HOST}:${SERVER_PORT}/open`, {
          method: 'GET',
          mode: 'no-cors',
        }).catch(error => console.log('Error opening ticket relay', error));
      }, TEXT_DELAY + 1000);
      return () => clearTimeout(printRelayOpen);
    }
  }, [canPrint]);

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

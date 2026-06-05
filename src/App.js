import styles from './App.module.css';
import React, { useEffect, useState } from 'react';
import { Route, Switch, withRouter } from 'react-router';
import { ROUTES, SERVER_HOST, SERVER_PORT } from './constants/constants';
import TicketPullScreen from './containers/TicketPullScreen/TicketPullScreen';
import TicketSurvey from './containers/TicketSurvey/TicketSurvey';
import TicketSpinner from './containers/TicketSpinner/TicketSpinner';
import TicketDisplay from './containers/TicketDisplayScreen/TicketDisplayScreen';
import DiagnosticPanel from './components/DiagnosticPanel/DiagnosticPanel';
import { Helmet } from 'react-helmet';
import bunnies from './containers/TicketSpinner/img/TransparentBunnies.png';
import font from './fonts/Palatino.otf';

const parseDelayMs = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const TICKET_SCREEN_PAGE_DELAY = parseDelayMs(
  process.env.REACT_APP_TICKET_PRINTED_SCREEN_DELAY_MS,
  50000
);
const TICKET_DETAILS_PAGE_DELAY = parseDelayMs(
  process.env.REACT_APP_DIGITAL_TICKET_SCREEN_DELAY_MS,
  60000
);
const MAIN_SCREEN_PAGE_DELAY = 45000;

const SHOW_DIAGNOSTICS = process.env.REACT_APP_SHOW_DIAGNOSTICS === 'true';

function App({ location }) {
  const [isPrinterConfigured, setIsPrinterConfigured] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // disable two-finger right click
    const rightClickListener = evt => evt.preventDefault();
    window.addEventListener('contextmenu', rightClickListener);
    return () => window.removeEventListener('contextmenu', rightClickListener);
  }, []);

  // Fetch initial printer state, then subscribe to SSE for updates
  useEffect(() => {
    let es;

    fetch(`http://${SERVER_HOST}:${SERVER_PORT}/printer-status`)
      .then(r => r.json())
      .then(({ printerOk }) => {
        console.log('initial printer status', printerOk);
        setIsPrinterConfigured(printerOk);
        setIsLoaded(true);
      })
      .catch(err => {
        console.log('could not fetch initial printer status — assuming ok', err);
        setIsLoaded(true);
      })
      .finally(() => {
        es = new EventSource(`http://${SERVER_HOST}:${SERVER_PORT}/printer-status-stream`);

        es.onmessage = event => {
          const { printerOk } = JSON.parse(event.data);
          console.log('printer status update', printerOk);
          setIsPrinterConfigured(printerOk);
        };

        es.onerror = error => {
          console.log('SSE connection error — staying in current mode', error);
        };
      });

    return () => es?.close();
  }, []);

  console.log('location.pathname', location.pathname);

  return (
    <section className={styles.app}>
      {/* the reset delay is different between the two pages*/}
      <TicketPullScreen
        resetDelay={
          location.pathname === ROUTES.TICKETDISPLAY
            ? TICKET_DETAILS_PAGE_DELAY
            : location.pathname === ROUTES.TICKETSPINNER
            ? TICKET_SCREEN_PAGE_DELAY
            : MAIN_SCREEN_PAGE_DELAY
        }
      />
      <Helmet>
        <link rel="preload" as="image" href={bunnies} />
        <link rel="preload" as="font" href={font} />
      </Helmet>
      <Switch>
        <Route
          path={ROUTES.MAINSCREEN}
          render={props => (
            <TicketSurvey
              {...props}
              isPrinterConfigured={isPrinterConfigured}
              isLoaded={isLoaded}
            />
          )}
        />
        <Route
          path={ROUTES.TICKETSPINNER}
          render={props => <TicketSpinner {...props} isPrinterConfigured={isPrinterConfigured} />}
        />
        <Route path={ROUTES.TICKETDISPLAY} component={TicketDisplay} />
      </Switch>
      {SHOW_DIAGNOSTICS && location.pathname === ROUTES.PULLSCREEN && (
        <DiagnosticPanel isPrinterConfigured={isPrinterConfigured} isLoaded={isLoaded} />
      )}
    </section>
  );
}

export default withRouter(App);

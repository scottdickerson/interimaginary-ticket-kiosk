import styles from './App.module.css';
import React from 'react';
import { Route, Switch, withRouter } from 'react-router';
import { ROUTES } from './constants/constants';
import TicketPullScreen from './containers/TicketPullScreen/TicketPullScreen';
import TicketSurvey from './containers/TicketSurvey/TicketSurvey';
import TicketSpinner from './containers/TicketSpinner/TicketSpinner';
import TicketDisplay from './containers/TicketDisplayScreen/TicketDisplayScreen';
import { Helmet } from 'react-helmet';
import bunnies from './containers/TicketSpinner/img/TransparentBunnies.png';
import font from './fonts/Palatino.otf';

const TICKET_SCREEN_PAGE_DELAY = 50000;
const TICKET_DETAILS_PAGE_DELAY = 60000;
const MAIN_SCREEN_PAGE_DELAY = 45000;

// const TICKET_SCREEN_PAGE_DELAY = 5000;
// const MAIN_SCREEN_PAGE_DELAY = 4000;

function App({ location }) {
  console.log('location.pathname', location.pathname);
  return (
    <section className={styles.app}>
      {/* the reset delay is different between the two pages*/}
      <TicketPullScreen
        resetDelay={
          location.pathname.includes(ROUTES.TICKETDISPLAY)
            ? TICKET_DETAILS_PAGE_DELAY
            : location.pathname.includes(ROUTES.TICKETSPINNER)
            ? TICKET_SCREEN_PAGE_DELAY
            : MAIN_SCREEN_PAGE_DELAY
        }
      />
      <Helmet>
        <link rel="preload" as="image" href={bunnies} />
        <link rel="preload" as="font" href={font} />
      </Helmet>
      <Switch>
        <Route path={ROUTES.MAINSCREEN} component={TicketSurvey} />
        <Route path={ROUTES.TICKETSPINNER} component={TicketSpinner} />
        <Route path={ROUTES.TICKETDISPLAY} component={TicketDisplay} />
      </Switch>
    </section>
  );
}

export default withRouter(App);

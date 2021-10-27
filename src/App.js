import styles from './App.module.css';
import React from 'react';
import { Route, Switch, withRouter } from 'react-router';
import { ROUTES } from './constants/constants';
import TicketPullScreen from './containers/TicketPullScreen/TicketPullScreen';
import TicketSurvey from './containers/TicketSurvey/TicketSurvey';
import TicketSpinner from './containers/TicketSpinner/TicketSpinner';
import { Helmet } from 'react-helmet';
import bunnies from './containers/TicketSpinner/img/TransparentBunnies.png';
import font from './fonts/Palatino.otf';

function App({ location }) {
  console.log('location.pathname', location.pathname);
  return (
    <section className={styles.app}>
      {/* the reset delay is different between the two pages*/}
      <TicketPullScreen resetDelay={location.pathname.includes('ticket') ? 50000 : 45000} />
      <Helmet>
        <link rel="preload" as="image" href={bunnies} />
        <link rel="preload" as="font" href={font} />
      </Helmet>
      <Switch>
        <Route path={ROUTES.MAINSCREEN} component={TicketSurvey} />
        <Route path={ROUTES.TICKETSPINNER} component={TicketSpinner} />
      </Switch>
    </section>
  );
}

export default withRouter(App);

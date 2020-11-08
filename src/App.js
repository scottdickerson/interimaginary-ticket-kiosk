import styles from './App.module.css';
import React from 'react';
import { Route, Switch } from 'react-router';
import { ROUTES } from './constants/constants';
import TicketPullScreen from './containers/TicketPullScreen/TicketPullScreen';
import TicketSurvey from './containers/TicketSurvey/TicketSurvey';
import TicketSpinner from './containers/TicketSpinner/TicketSpinner';

function App() {
  return (
    <section className={styles.app}>
      <TicketPullScreen />
      <Switch>
        <Route path={ROUTES.MAINSCREEN} component={TicketSurvey} />
        <Route path={ROUTES.TICKETSPINNER} component={TicketSpinner} />
      </Switch>
    </section>
  );
}

export default App;

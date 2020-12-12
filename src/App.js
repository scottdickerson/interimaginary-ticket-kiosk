import styles from './App.module.css';
import React from 'react';
import { Route, Switch } from 'react-router';
import { ROUTES } from './constants/constants';
import TicketPullScreen from './containers/TicketPullScreen/TicketPullScreen';
import TicketSurvey from './containers/TicketSurvey/TicketSurvey';
import TicketSpinner from './containers/TicketSpinner/TicketSpinner';
import { Helmet } from 'react-helmet';
import bunnies from './containers/TicketSpinner/img/Bunnies.jpg';
import Frame02 from './components/BunnyAnimation/img/Frame_02.jpg';
import Frame03 from './components/BunnyAnimation/img/Frame_03.jpg';
import Frame04 from './components/BunnyAnimation/img/Frame_04.jpg';
import Frame05 from './components/BunnyAnimation/img/Frame_05.jpg';

function App() {
  return (
    <section className={styles.app}>
      <TicketPullScreen />
      <Helmet>
        <link rel="preload" as="image" href={bunnies} />
        <link rel="preload" as="image" href={Frame02} />
        <link rel="preload" as="image" href={Frame03} />
        <link rel="preload" as="image" href={Frame04} />
        <link rel="preload" as="image" href={Frame05} />
      </Helmet>
      <Switch>
        <Route path={ROUTES.MAINSCREEN} component={TicketSurvey} />
        <Route path={ROUTES.TICKETSPINNER} component={TicketSpinner} />
      </Switch>
    </section>
  );
}

export default App;

import React from 'react';
import { withRouter } from 'react-router';
import { ROUTES } from '../../constants/constants';
import PullScreen from '../../components/PullScreen/PullScreen';

import styles from './TicketPullScreen.module.css';

const TicketPullScreen = ({ history, location, resetDelay }) => {
  const handleClick = () => {
    history.push(ROUTES.MAINSCREEN);
  };

  const handleReset = () => {
    history.push(ROUTES.PULLSCREEN);
  };

  const isFrontScreen = location?.pathname === ROUTES.PULLSCREEN;

  return (
    <PullScreen
      onReset={handleReset}
      onClick={isFrontScreen ? handleClick : undefined}
      resetDelay={resetDelay}
      isVisible={isFrontScreen}
      inactivityTracking={!isFrontScreen}>
      <div className={styles.ticketPullScreen}>
        <h1 className={styles.title}>Hello...</h1>
        <p className={styles.description}>
          You can receive a ticket here<br></br>
          but first we have to ask you a few questions
        </p>
        <button type="button" className={styles.button}>
          <div className={styles.callToAction}>
            OK
            <br /> let&prime;s begin
          </div>
        </button>
      </div>
    </PullScreen>
  );
};

export default withRouter(TicketPullScreen);

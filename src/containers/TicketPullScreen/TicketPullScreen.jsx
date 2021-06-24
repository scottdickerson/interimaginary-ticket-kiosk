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

  return (
    <PullScreen
      onClick={handleClick}
      onReset={handleReset}
      resetDelay={resetDelay}
      isVisible={location?.pathname === ROUTES.PULLSCREEN}>
      <div className={styles.ticketPullScreen}>
        <h1 className={styles.title}>Hello...</h1>
        <p className={styles.description}>
          You can receive a ticket here<br></br>
          but first we have to ask you a few questions
        </p>
        <button className={styles.button} onClick={handleClick}>
          OK
          <br /> let's begin
        </button>
      </div>
    </PullScreen>
  );
};

export default withRouter(TicketPullScreen);

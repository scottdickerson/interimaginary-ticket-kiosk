import React from 'react';

import styles from './TicketPullScreen.module.css';

const TicketPullScreen = () => {
  return (
    <div className={styles.pullScreen}>
      <h1 className={styles.title}>Hello...</h1>
      <p>You can receive a ticket here</p>
      <p>but first we have to ask you a few questions</p>
      <button onClick={() => console.log('button clicked')}>OK let's begin</button>
    </div>
  );
};

export default TicketPullScreen;

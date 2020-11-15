import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './BunnyAnimation.module.css';
import Frame02 from './img/Frame_02.jpg';
import Frame03 from './img/Frame_03.jpg';
import Frame04 from './img/Frame_04.jpg';
import Frame05 from './img/Frame_05.jpg';
import Animation from '../Animation/Animation';
import { ANIMATION_STATES } from '../../constants/constants';

const frames = [Frame02, Frame03, Frame04, Frame05];

const propTypes = {
  /** total delay in milliseconds */
  totalDelay: PropTypes.number,
  /** the maximum amount of time to pause between animations */
  pauseTime: PropTypes.number,
  /** callback called once the animation has finished */
  onFinished: PropTypes.func.isRequired,
  /** has the animation started */
  isStarted: PropTypes.bool.isRequired,
};

const defaultProps = {
  totalDelay: 10000,
  pauseTime: 1000,
  isStarted: true,
};

/** handles the pause and total b */
const BunnyProgressBar = ({ totalDelay, onFinished, pauseTime, isStarted }) => {
  const [xOffset, setXOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTime = useRef();
  // keep track of how long I've been pausing

  const maxPercentage = 88;

  /** calculates the new xOffset and updates state */
  const calculateXOffset = timestamp => {
    if (startTime?.current === undefined) {
      // Keep track of the original start time of the animation to calculate the offsets
      startTime.current = timestamp;
    }
    const elapsed = timestamp - startTime.current;
    const xOffsetPercentage = Math.min(elapsed / totalDelay, 1) * maxPercentage;
    setXOffset(xOffsetPercentage);
    // Stop animating if we're past the total delay
    if (elapsed > totalDelay) {
      // we're finished animating
      console.log('all done');
      setIsPaused(true);
      onFinished();
    }
  };

  // Watch the isPaused to trigger a timeout to unpause the rabbit
  useEffect(() => {
    let pauseTimer;
    if (isPaused && xOffset !== maxPercentage) {
      // if we haven't finished yet
      pauseTimer = setTimeout(() => setIsPaused(false), pauseTime);
    }
    return () => clearTimeout(pauseTimer);
  }, [isPaused, pauseTime, xOffset]);

  const handlePaused = () => {
    console.log('paused');
    setIsPaused(true);
  };

  return (
    <div className={styles.bunnyAnimation}>
      <div className={styles.bunnyLeftSideBar}></div>
      {isStarted ? (
        <Animation
          alt="Bunny hopping"
          frames={frames}
          style={{ left: `${xOffset}%`, width: '200px' }}
          shouldLoop
          frameDelay={200}
          state={isPaused ? ANIMATION_STATES.PAUSED : ANIMATION_STATES.PLAYING}
          onFinished={handlePaused}
          onNextFrame={calculateXOffset}
        />
      ) : null}
      <div className={styles.bunnyRightSideBar}></div>
    </div>
  );
};

BunnyProgressBar.propTypes = propTypes;
BunnyProgressBar.defaultProps = defaultProps;
export default BunnyProgressBar;

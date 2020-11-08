import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './BunnyAnimation.module.css';
import Frame01 from './img/Frame_01.jpg';
import Frame02 from './img/Frame_02.jpg';
import Frame03 from './img/Frame_03.jpg';
import Frame04 from './img/Frame_04.jpg';
import Frame05 from './img/Frame_05.jpg';
import isNil from 'lodash/isNil';

const frames = [Frame01, Frame02, Frame03, Frame04, Frame05];

const propTypes = {
  /** total delay in milliseconds */
  totalDelay: PropTypes.number,
  /** the maximum amount of time to pause between animations */
  pauseTime: PropTypes.number,
};

const defaultProps = {
  totalDelay: 10000,
  pauseTime: 2000,
};

const BunnyAnimation = ({ totalDelay, onFinished, pauseTime }) => {
  const [xOffset, setXOffset] = useState(0);
  const startTime = useRef();
  const totalPauseTime = useRef(0);
  const [elapsedState, setElapsedState] = useState();
  // keep track of how long I've been pausing
  const pauseStartTime = useRef();

  const maxPercentage = 80;

  // Dynamically calculate the current frame from the xOffset
  const currentFrame = Math.floor(xOffset / 2) % frames.length;

  /** calculates the new xOffset and updates state */
  const calculateXOffset = timestamp => {
    if (startTime?.current === undefined) {
      // Keep track of the original start time of the animation to calculate the offsets
      startTime.current = timestamp;
    }
    const elapsed = timestamp - startTime.current;
    const elapsedPauseTime = pauseStartTime?.current ? elapsed - pauseStartTime?.current : 0;
    // console.log(`elapsed pause time: ${elapsedPauseTime}`);
    // console.log(`currentFrame: ${currentFrame} frames: ${frames.length - 1}`);
    // If I've reached the end of an animation frame sequence, need to start pausing
    if (currentFrame === frames.length - 1 && !pauseStartTime?.current) {
      console.log('need to pause');
      pauseStartTime.current = elapsed;
    }
    // If I'm not pausing then update the xOffset
    if (!pauseStartTime?.current) {
      const xOffsetPercentage =
        Math.min((elapsed - totalPauseTime.current) / (totalDelay - totalPauseTime.current), 1) *
        maxPercentage;
      console.log(
        `elapsed: ${elapsed} totalPauseTime: ${totalPauseTime.current} totalDelay: ${totalDelay} updating x offset: ${xOffsetPercentage}`
      );
      setXOffset(xOffsetPercentage);
    } else if (elapsedPauseTime > pauseTime) {
      // calculate do I need to stop pausing?
      console.log('unpausing');

      // keep track of the total pause time
      totalPauseTime.current = totalPauseTime.current + elapsed - pauseStartTime.current;
      pauseStartTime.current = undefined; // Stop pausing

      // Force it to the next frame to keep it from pausing again
      setXOffset(xOffset => xOffset + 2);
    }
    // Stop animating if we're past the total delay
    if (elapsed > totalDelay) {
      // we're finished animating
      console.log('all done');
      onFinished();
    } else {
      setElapsedState(elapsed); // this will trigger the use effect below and force a rerender every time
    }
  };
  useEffect(() => {
    // this intentionally fires on every render
    if (isNil(elapsedState) || elapsedState < totalDelay) {
      window.requestAnimationFrame(calculateXOffset);
    }
  });
  return (
    <div className={styles.bunnyAnimation}>
      {!isNil(xOffset) ? (
        <img
          width="200px"
          src={frames[currentFrame]}
          alt="Bunny hopping"
          style={{ left: `${xOffset}%` }}
        />
      ) : null}
    </div>
  );
};

BunnyAnimation.propTypes = propTypes;
BunnyAnimation.defaultProps = defaultProps;
export default BunnyAnimation;

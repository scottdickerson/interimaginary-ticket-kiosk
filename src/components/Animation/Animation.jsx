import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ANIMATION_STATES } from '../../constants/constants';

const propTypes = {
  /** set of frames to animate */
  frames: PropTypes.arrayOf(PropTypes.string),
  /** optional property to set the ms for each frame */
  frameDelay: PropTypes.number,
  /** callback function when frames have finished animating */
  onFinished: PropTypes.func,
  /** optional style if you want the animation to move */
  style: PropTypes.object,
  /** should the animation start playing */
  state: PropTypes.oneOf(['PLAYING', 'PAUSED']),
  /** optional function to change something (maybe style) on each animation frame, called back with the total time elapsed so far */
  onNextFrame: PropTypes.func,
  /** should the animation be on loop */
  shouldLoop: PropTypes.bool,
};

const defaultProps = {
  frameDelay: 150,
  state: 'PLAYING',
  shouldLoop: false,
};

const Animation = ({
  frames,
  onFinished,
  state,
  onNextFrame,
  frameDelay,
  style,
  alt,
  shouldLoop,
}) => {
  const startTime = useRef();
  // the elapsed time when the pause started
  const startPauseTime = useRef();
  // the sum of al total pause time
  const totalPauseTime = useRef(0);
  // Have to use a ref here for isPlaying so that it gets picked up in the recursive determineFrame calls
  const isPlaying = useRef(state === ANIMATION_STATES.PLAYING);
  // Start the frame at 0
  const [currentFrame, setCurrentFrame] = useState(0);

  /** callback on animation to determine the current frame to show */
  const determineFrame = timestamp => {
    if (startTime?.current === undefined) {
      // Keep track of the original start time of the animation to calculate the offsets
      startTime.current = timestamp;
    }

    const elapsed = timestamp - startTime.current;

    // if we've just started pausing, then keep track of the startPauseTime so we can calculate totalPauseTime
    if (!isPlaying.current && startPauseTime.current === undefined) {
      startPauseTime.current = elapsed;
    }

    // This means we just started playing again
    if (isPlaying.current && startPauseTime.current) {
      // Total up the additional pause time
      totalPauseTime.current = totalPauseTime.current + elapsed - startPauseTime.current;
      // Clear the startPauseTime
      startPauseTime.current = undefined;
    }

    // Need to adjust the elapsed timescale to address any pauses that may have occurred
    const elapsedAdjustedForPauses = elapsed - totalPauseTime.current;

    // Using the elapsed adjusted for pauses so that we don't skip a frame,
    const nextFrame = Math.floor(elapsedAdjustedForPauses / frameDelay) % frames.length;

    if (onNextFrame && isPlaying.current) {
      // if they're listening to my frames, call back
      onNextFrame(elapsedAdjustedForPauses);
    }

    setCurrentFrame(currentFrame => {
      if (isPlaying.current) {
        window.requestAnimationFrame(determineFrame);
      }
      if (currentFrame !== nextFrame) {
        console.log(
          `timestamp: ${timestamp} currentFrame: ${currentFrame} nextFrame: ${nextFrame}`
        );
      }
      return currentFrame !== nextFrame ? nextFrame : currentFrame;
    });
  };

  // Kick off the initial animation, it should continue recursively
  useEffect(() => {
    if (state === ANIMATION_STATES.PLAYING) {
      window.requestAnimationFrame(determineFrame);
      isPlaying.current = true;
    } else {
      // flip the reference to stop the playing
      isPlaying.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // If I've reached the end of an animation frame sequence I need to callback the onFinished
  useEffect(() => {
    console.log(`currentFrame: ${currentFrame}`);
    if (currentFrame >= frames.length - 1) {
      // If they're listening to onFinished then listen
      if (onFinished) {
        onFinished();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrame]);

  return frames.map((frame, index) => (
    <img
      key={`img-frame-${index}`}
      src={frames[index]}
      style={{ ...style, display: `${index === currentFrame ? 'inline-block' : 'none'}` }} // need to preload all images and only show the currentframe
      alt={alt}
    />
  ));
};

Animation.propTypes = propTypes;
Animation.defaultProps = defaultProps;
export default Animation;

import bunnyVideo from '../BunnyAnimationRedux/IID-bunny-animation-no-alpha.mp4';
import React, { useEffect, useRef } from 'react';
import styles from './BunnyAnimation.module.css';

const BUNNY_PLAYBACK_RATE = parseFloat(process.env.REACT_APP_BUNNY_PLAYBACK_RATE) || 1.5;

const BunnyAnimationRedux = ({ isStarted, onFinished }) => {
  const videoRef = useRef();
  useEffect(() => {
    if (videoRef.current) {
      if (isStarted) {
        videoRef.current.play();
        videoRef.current.playbackRate = BUNNY_PLAYBACK_RATE;
      } else {
        videoRef.current.pause();
      }
    }
  }, [isStarted]);

  return (
    <video
      className={styles.bunnyAnimation}
      ref={videoRef}
      height="100"
      width="800"
      onEnded={onFinished}>
      <source src={bunnyVideo} type="video/mp4"></source>
    </video>
  );
};

export default BunnyAnimationRedux;

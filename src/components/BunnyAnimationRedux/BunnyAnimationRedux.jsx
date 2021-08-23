import bunnyVideo from '../BunnyAnimationRedux/IID-bunny-animation-no-alpha.mp4';
import React, { useEffect, useRef } from 'react';
import styles from './BunnyAnimation.module.css';

const BunnyAnimationRedux = ({ isStarted, onFinished }) => {
  const videoRef = useRef();
  useEffect(() => {
    if (videoRef.current) {
      if (isStarted) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isStarted]);

  return (
    <video
      className={styles.bunnyAnimation}
      ref={videoRef}
      height="200"
      width="800"
      onEnded={onFinished}>
      <source src={bunnyVideo} type="video/mp4"></source>
    </video>
  );
};

export default BunnyAnimationRedux;

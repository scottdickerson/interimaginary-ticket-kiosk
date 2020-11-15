import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Question.module.css';
import BunnyAnimation from '../BunnyAnimation/BunnyAnimation';
import Button from '../Button/Button';
import classnames from 'classnames';

const propTypes = {
  question: PropTypes.string,
  questionLineTwo: PropTypes.string,
  choices: PropTypes.arrayOf(PropTypes.string),
  onSelection: PropTypes.func,
};

const Question = ({ question, questionLineTwo, choices, onSelection, className }) => {
  const [isProgressBarRunning, setIsProgressBarRunning] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState();
  // if the question changes reset the progress bar
  useEffect(() => {
    setIsProgressBarRunning(false);
  }, [question]);
  return (
    <section className={classnames(styles.question, className)}>
      <h2>{question}</h2>
      {questionLineTwo ? <h2>{questionLineTwo}</h2> : null}
      <div className={styles.choices}>
        {choices.map(choice => (
          <Button
            key={choice}
            disabled={isProgressBarRunning && choice !== selectedChoice}
            selected={choice === selectedChoice}
            onClick={() => {
              setSelectedChoice(choice);
              setIsProgressBarRunning(true);
            }}>
            {choice}
          </Button>
        ))}
      </div>
      <BunnyAnimation
        key={question} /* bunny animation should reset every time the question changes */
        isStarted={isProgressBarRunning}
        onFinished={() => onSelection()}
        totalDelay={3000}
      />
    </section>
  );
};

Question.propTypes = propTypes;
export default Question;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Survey.module.css';
import Question from '../Question/Question';
import back from './back.png';
import close from './close.png';

const propTypes = {
  /** an array of questions to ask */
  questions: PropTypes.arrayOf(
    PropTypes.shape({ question: PropTypes.string, choices: PropTypes.arrayOf(PropTypes.string) })
  ),
  /** survey has finished */
  onSurveyFinished: PropTypes.func,
  /** Cancel the survey */
  onClose: PropTypes.func,
  shouldAnimateBunny: PropTypes.bool,
};

const Survey = ({ questions, onSurveyFinished, onClose, shouldAnimateBunny = true }) => {
  // keeps track of the current question
  const [currentQuestion, setCurrentQuestion] = useState(0);
  return (
    <div className={styles.survey}>
      <header className={styles.header}>
        <button
          className={styles.surveyBackButton}
          onClick={() => {
            if (currentQuestion === 0) {
              onClose();
            } else {
              setCurrentQuestion(question => question - 1);
            }
          }}>
          <img height={28} src={back} alt="back" />
        </button>
        <button className={styles.surveyButton} onClick={() => onClose()}>
          <img height={28} src={close} alt="close" />
        </button>
      </header>
      <Question
        className={styles.question}
        shouldAnimateBunny={shouldAnimateBunny}
        {...questions[currentQuestion]}
        onSelection={() => {
          if (currentQuestion !== questions.length - 1) {
            setCurrentQuestion(question => question + 1);
          } else {
            onSurveyFinished();
          }
        }}
      />
    </div>
  );
};

Survey.propTypes = propTypes;
export default Survey;

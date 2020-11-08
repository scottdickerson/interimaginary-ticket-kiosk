import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Survey.module.css';
import Question from '../Question/Question';

const propTypes = {
  /** an array of questions to ask */
  questions: PropTypes.arrayOf(
    PropTypes.shape({ question: PropTypes.string, choices: PropTypes.arrayOf(PropTypes.string) })
  ),
  /** survey has finished */
  onSurveyFinished: PropTypes.func,
  /** Cancel the survey */
  onClose: PropTypes.func,
};

const Survey = ({ questions, onSurveyFinished, onClose }) => {
  // keeps track of the current question
  const [currentQuestion, setCurrentQuestion] = useState(0);
  return (
    <div className={styles.survey}>
      <header className={styles.header}>
        <button
          onClick={() => {
            if (currentQuestion === 0) {
              onClose();
            } else {
              setCurrentQuestion(question => question - 1);
            }
          }}>
          back
        </button>
        <button onClick={() => onClose()}>close</button>
      </header>
      <Question
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

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Survey.module.css';
import Question from '../Question/Question';
import Header from '../Header/Header';

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
  const handleBack = useCallback(() => {
    if (currentQuestion === 0) {
      onClose();
    } else {
      setCurrentQuestion(question => question - 1);
    }
  }, [currentQuestion, onClose]);

  return (
    <div className={styles.survey}>
      <Header onBack={handleBack} onClose={onClose} />
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

import React from 'react';
import PropTypes from 'prop-types';
import styles from './Question.module.css';

const propTypes = {
  question: PropTypes.string,
  questionLineTwo: PropTypes.string,
  choices: PropTypes.arrayOf(PropTypes.string),
  onSelection: PropTypes.func,
};

const Question = ({ question, questionLineTwo, choices, onSelection }) => {
  return (
    <section className={styles.question}>
      <h2>{question}</h2>
      {questionLineTwo ? <h2>{questionLineTwo}</h2> : null}
      <div className={styles.choices}>
        {choices.map(choice => (
          <button onClick={() => onSelection()}>{choice}</button>
        ))}
      </div>
    </section>
  );
};

Question.propTypes = propTypes;
export default Question;

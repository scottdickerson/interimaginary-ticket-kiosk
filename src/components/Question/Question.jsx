import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Question.module.css';
import BunnyAnimation from '../BunnyAnimation/BunnyAnimation';
import SimpleChoiceRenderer from './SimpleChoiceRenderer';
import GridChoiceRenderer from './GridChoiceRenderer';
import classnames from 'classnames';

const propTypes = {
  question: PropTypes.string,
  questionLineTwo: PropTypes.string,
  choices: PropTypes.arrayOf(PropTypes.string),
  onSelection: PropTypes.func,
  shouldAnimateBunny: PropTypes.bool,
};

const Question = ({
  question,
  questionLineTwo,
  choices,
  onSelection,
  className,
  shouldAnimateBunny,
}) => {
  const [isProgressBarRunning, setIsProgressBarRunning] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState();
  // if the question changes reset the progress bar
  useEffect(() => {
    setIsProgressBarRunning(false);
  }, [question]);
  return (
    <section className={classnames(styles.question, className)}>
      <h2>
        {question}
        {questionLineTwo ? (
          <>
            <br></br>
            {questionLineTwo}
          </>
        ) : null}
      </h2>

      {choices.length < 10 ? (
        <SimpleChoiceRenderer
          choices={choices}
          isProgressBarRunning={isProgressBarRunning}
          setIsProgressBarRunning={setIsProgressBarRunning}
          selectedChoice={selectedChoice}
          setSelectedChoice={setSelectedChoice}
          onSelection={onSelection}
          shouldAnimateBunny={shouldAnimateBunny}
        />
      ) : (
        <GridChoiceRenderer
          choices={choices}
          isProgressBarRunning={isProgressBarRunning}
          setIsProgressBarRunning={setIsProgressBarRunning}
          selectedChoice={selectedChoice}
          setSelectedChoice={setSelectedChoice}
          onSelection={onSelection}
          shouldAnimateBunny={shouldAnimateBunny}></GridChoiceRenderer>
      )}
      {shouldAnimateBunny ? (
        <BunnyAnimation
          key={question} /* bunny animation should reset every time the question changes */
          isStarted={isProgressBarRunning}
          onFinished={() => onSelection()}
          totalDelay={2000}
        />
      ) : null}
    </section>
  );
};

Question.propTypes = propTypes;
export default Question;

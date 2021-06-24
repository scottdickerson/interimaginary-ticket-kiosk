import React from 'react';
import PropTypes from 'prop-types';
import styles from './Question.module.css';
import Button from '../Button/Button';
import classNames from 'classnames';

const propTypes = {
  choices: PropTypes.arrayOf(PropTypes.string),
  isProgressBarRunning: PropTypes.bool,
  setIsProgressBarRunning: PropTypes.func,
  selectedChoice: PropTypes.string,
  setSelectedChoice: PropTypes.func,
  onSelection: PropTypes.func,
  shouldAnimateBunny: PropTypes.bool,
};

const SimpleChoiceRenderer = ({
  choices,
  isProgressBarRunning,
  setIsProgressBarRunning,
  selectedChoice,
  setSelectedChoice,
  onSelection,
  shouldAnimateBunny,
}) => {
  return (
    <div className={classNames(styles.choices, styles.simpleChoices)}>
      {choices.map((choice, i) => (
        <Button
          key={`${choice}-${i}`}
          disabled={isProgressBarRunning && choice !== selectedChoice}
          selected={choice === selectedChoice}
          onClick={() => {
            setSelectedChoice(choice);
            setIsProgressBarRunning(true);
            if (!shouldAnimateBunny) {
              onSelection();
            }
          }}>
          {choice}
        </Button>
      ))}
    </div>
  );
};

SimpleChoiceRenderer.propTypes = propTypes;

export default SimpleChoiceRenderer;

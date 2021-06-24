import React from 'react';
import styles from './GridChoiceRenderer.module.css';
import Button from '../Button/Button';

const GridChoiceRenderer = ({
  choices,
  isProgressBarRunning,
  setIsProgressBarRunning,
  selectedChoice,
  setSelectedChoice,
  onSelection,
  shouldAnimateBunny,
}) => (
  <div className={styles.gridContainer}>
    <div className={styles.gridChoices}>
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
  </div>
);

export default GridChoiceRenderer;

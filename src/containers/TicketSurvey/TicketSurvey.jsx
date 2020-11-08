import React from 'react';
import Survey from '../../components/Survey/Survey';
import MainScreen from '../../components/MainScreen/MainScreen';
import { ROUTES } from '../../constants/constants';
import { withRouter } from 'react-router';

const questions = [
  { question: 'What color is the number seven?', choices: ['red', 'green', 'blue'] },
  {
    question: 'If you replace every single part of your boat,',
    questionLineTwo: 'is it still the same boat?',
    choices: ['yes', 'no', 'both yes and no...'],
  },
  {
    question: 'Choose one of these to accompany you:',
    choices: ['chimera', 'cyborg', 'cyclops', 'dragon'],
  },
];

const TicketSurvey = ({ history }) => {
  const handleClose = () => {
    history.push(ROUTES.PULLSCREEN);
  };
  const handleFinished = () => {
    history.push(ROUTES.TICKETSPINNER);
  };
  return (
    <MainScreen>
      <Survey questions={questions} onClose={handleClose} onSurveyFinished={handleFinished} />
    </MainScreen>
  );
};

export default withRouter(TicketSurvey);

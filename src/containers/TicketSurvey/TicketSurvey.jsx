import React, { useMemo } from 'react';
import Survey from '../../components/Survey/Survey';
import shuffle from 'lodash/shuffle';
import MainScreen from '../../components/MainScreen/MainScreen';
import { ROUTES } from '../../constants/constants';
import { withRouter } from 'react-router';

const TRAVELER_QUESTION_TYPE = 'TRAVELER_QUESTION_TYPE';

const questions = [
  {
    question: 'If you replace every single part of your boat,',
    questionLineTwo: 'is it still the same boat?',
    choices: ['yes', 'no', 'both yes and no...'],
  },
  {
    question: 'Which came first, ',
    questionLineTwo: 'the chicken or the egg?',
    choices: ['chicken', 'egg', 'opt out...'],
  },
  { question: 'What color is the number seven?', choices: ['red', 'green', 'blue'] },
  {
    question: 'If you do everything there is to do,',
    questionLineTwo: 'what can you do next?',
    choices: ['start over', 'take it easy', `I'm busy...`],
  },
  {
    question: 'Is doing nothing doing something?',
    choices: ['absolutely', 'definitely not', `I'm busy...`],
  },
  {
    question: 'Is that a fish in your ear?',
    choices: [
      `I can't hear you, I have a fish in my ear`,
      `I can't hear you, I have a fish in my ear`,
      `I can't hear you, I have a fish in my ear`,
    ],
  },
  {
    question: 'Is there more than one of anything?',
    choices: [`no`, `depends on the definition of anything`, `I am singularly unique... `],
  },
  {
    question: 'Are there other universes',
    questionLineTwo: 'besides our own?',
    choices: [`there are infinite universes`, `this is the only universe`, `besides U of T?`],
  },
  {
    question: `If someone says "I'm lying,"`,
    questionLineTwo: 'is that person lying?',
    choices: [`yes`, `no`, `yes and no...`],
  },
  {
    question: `Is the answer to this question "no"?`,
    choices: [`yes`, `no`, `orange`],
  },
  {
    question: `Can you step in the same river twice?`,
    choices: [`yes`, `no`, `it depends...`],
  },
  {
    question: `Choose one of these animals`,
    questionLineTwo: 'to accompany you on your journey',
    choices: [`raven`, `snow leopard`, `rattlesnake`],
  },
  {
    question: `What would a square circle look like?`,
    choices: [`square`, `circular`, `squircular`],
  },
  {
    question: `If you could have one of these`,
    questionLineTwo: 'superpowers, which would you choose?',
    choices: [`traveling through time`, `talking with animals`, `shape-shifting`],
  },
  {
    question: `Have we been visited by time travelers`,
    questionLineTwo: 'from the future?',
    choices: [`yes`, `no`, `how did you find me?`],
  },
  {
    question: `Do animals have feelings?`,
    choices: [`of course`, `of course`, `of course`],
  },
  {
    question: `Are more things smaller than you`,
    questionLineTwo: 'than larger than you?',
    choices: [`I contain multitudes`, `I am insignificant`, `turtles all the way down`],
  },
  {
    question: `How high are your hopes?`,
    choices: [`I don't expect much`, `I never get what I deserve`, `I am pleasantly surprised`],
  },
  {
    question: `Who owns the air?`,
    choices: [`everyone`, `no one`, `anyone`],
  },
  {
    question: `Who makes the rules?`,
    choices: [`they do`, `I do.`, `there are no rules`],
  },
  {
    question: `Why is there something rather than nothing?`,
    choices: [``, ``, ``],
  },
  {
    question: `How much is enough?`,
    choices: [`give me more`, `I'm fine`, `give me more`],
  },
  {
    question: `How fast are you moving?`,
    choices: [
      `I'm standing still`,
      `this is a pretty slow interface`,
      `492,126 mph, riding on the earth`,
    ],
  },
  {
    question: `Are you thinking what I'm thinking?`,
    choices: [`what are you thinking?`, `you tell me first`, `we are on the same page`],
  },
  {
    question: 'Choose one of these to accompany you:',
    type: TRAVELER_QUESTION_TYPE,
    choices: [
      'centaur',
      'djinn',
      'elf',
      'gnome',
      'goblin',
      'golem',
      'gremlin',
      'imp',
      'minotaur',
      'ogre',
      'orc',
      'pixie',
      'siren',
      'sorcerer',
      'sphinx',
      'sprite',
      'troll',
      'witch',
      'wizard',
      'yeti',
    ],
  },
  {
    question: 'Choose one of these to accompany you:',
    type: TRAVELER_QUESTION_TYPE,
    choices: [
      'chimera',
      'cyborg',
      'cyclops',
      'dragon',
      'dybbuk',
      'ghoul',
      'gorgon',
      'griffin',
      'harpy',
      'hydra',
      'mermaid',
      'phoenix',
      'poltergeist',
      'satyr',
      'trickster',
      'triffid',
      'vampire',
      'werewolf',
      'wraith',
      'zombie',
    ],
  },
];

const TicketSurvey = ({ history }) => {
  console.log('total questions', questions?.length);
  const selectedQuestions = useMemo(
    () => [
      // select 5 non-traveler questions at random
      ...shuffle(questions.filter(question => question.type !== TRAVELER_QUESTION_TYPE)).slice(
        0,
        6
      ),

      //...shuffle(questions.filter(question => question.type !== TRAVELER_QUESTION_TYPE)).slice(
      // TO TEST ALL QUESTIONS comment out the next
      //  ...questions.filter(question => question.type !== TRAVELER_QUESTION_TYPE),
      // ), // then select 1 traveler questions at random
      // ...shuffle(questions.filter(question => question.type === TRAVELER_QUESTION_TYPE)).slice(
      //   0,
      //   1
      // ),
    ],
    []
  );
  const handleClose = () => {
    history.push(ROUTES.PULLSCREEN);
  };
  const handleFinished = () => {
    history.push(ROUTES.TICKETSPINNER);
  };
  return (
    <MainScreen>
      <Survey
        key={JSON.stringify(selectedQuestions)}
        questions={selectedQuestions}
        onClose={handleClose}
        onSurveyFinished={handleFinished}
      />
    </MainScreen>
  );
};

export default withRouter(TicketSurvey);

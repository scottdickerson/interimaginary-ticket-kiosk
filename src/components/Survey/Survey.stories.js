import React from 'react';

import Survey from './Survey';

const story = {
  title: 'components/Survey',
  component: Survey,
  argTypes: {
    onSurveyFinished: { action: 'survey finished' },
    onClose: { action: 'close survey' },
  },
};

const questions = [
  { question: 'What color is the number seven?', choices: ['red', 'green', 'blue'] },
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
      `I can't hear you, I have a fish in my ear.`,
      `I can't hear you, I have a fish in my ear. `,
      `I can't hear you, I have a fish in my ear. `,
    ],
  },
  {
    question: 'Is there more than one of anything?',
    choices: [`no`, `depends on the definition of anything`, `I am singularly unique... `],
  },
  {
    question: 'Are there other universes besides our own?',
    choices: [`yes`, `no`, `maybe...`],
  },
  {
    question: `If someone says "I'm lying,"`,
    questionLineTwo: 'is that person lying?',
    choices: [`yes`, `no`, `yes and no...`],
  },
  {
    question: `Is the answer to this question "no"?`,
    choices: [`yes`, `no`, `???`],
  },
  {
    question: `Can you step in the same river twice?`,
    choices: [`yes`, `no`, `it depends...`],
  },
  {
    question: `Which of these would you choose `,
    questionLineTwo: 'to be your spirit animal?',
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
    choices: [`yes`, `no`, `How did you find me?`],
  },
];

export default story;

const Template = args => <Survey {...args}></Survey>;

export const Default = Template.bind({});

Default.args = {
  questions,
};

export const ShouldNotAnimateBunny = () => (
  <Survey shouldAnimateBunny={false} questions={questions}></Survey>
);

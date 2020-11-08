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

export default story;

const Template = args => <Survey {...args}></Survey>;

export const Default = Template.bind({});

Default.args = {
  questions: [
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
  ],
};

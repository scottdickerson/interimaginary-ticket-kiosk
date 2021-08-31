import React from 'react';

import Question from './Question';

const story = {
  title: 'components/Question',
  component: Question,
  argTypes: { onSelection: { action: 'clicked' } },
};

export default story;

const Template = args => <Question {...args}></Question>;

export const Default = Template.bind({});

Default.args = {
  question: 'What color is the number seven?',
  choices: ['red', 'green', 'blue'],
};

export const QuestionsWithSameAnswer = Template.bind({});

QuestionsWithSameAnswer.args = {
  question: 'Is something also nothing',
  choices: ['', '', ''],
};

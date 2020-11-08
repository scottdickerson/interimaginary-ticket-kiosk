import React from 'react';

import PullScreen from './PullScreen';

const story = {
  title: 'components/PullScreen',
  component: PullScreen,
  argTypes: { onClick: { action: 'clicked' }, onReset: { action: 'on reset' } },
};

export default story;

const Template = args => <PullScreen {...args}></PullScreen>;

export const Default = Template.bind({});

Default.args = {
  children: 'Hi there, I reset in 3 seconds after you click me',
  resetDelay: 3000,
};

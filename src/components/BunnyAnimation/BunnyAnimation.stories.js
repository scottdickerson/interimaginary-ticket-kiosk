import React from 'react';

import BunnyAnimation from './BunnyAnimation';

const story = {
  title: 'components/BunnyAnimation',
  component: BunnyAnimation,
  argTypes: { onFinished: { action: 'finished' } },
};

export default story;

const Template = args => <BunnyAnimation {...args}></BunnyAnimation>;

export const Default = Template.bind({});

Default.args = {
  totalDelay: 8000,
};

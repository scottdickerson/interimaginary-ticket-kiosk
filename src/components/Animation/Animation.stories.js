import React from 'react';

import Frame01 from '../BunnyAnimation/img/Frame_01.jpg';
import Frame02 from '../BunnyAnimation/img/Frame_02.jpg';
import Frame03 from '../BunnyAnimation/img/Frame_03.jpg';
import Frame04 from '../BunnyAnimation/img/Frame_04.jpg';
import Frame05 from '../BunnyAnimation/img/Frame_05.jpg';

import Animation from './Animation';

const frames = [Frame01, Frame02, Frame03, Frame04, Frame05];

const story = {
  title: 'components/Animation',
  component: Animation,
  argTypes: { onFinished: { action: 'finished' }, onNextFrame: { action: 'onNextFrame' } },
};

export default story;

const Template = args => <Animation {...args}></Animation>;

export const Default = Template.bind({});

Default.args = {
  frames,
  frameDelay: 300,
  shouldLoop: true,
  alt: 'Bunny hopping',
  style: { width: '200px' },
};

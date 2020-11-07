import React from 'react';
import MainScreen from './MainScreen';

const story = {
  title: 'components/MainScreen',
  component: MainScreen,
};

export default story;

const Template = args => <MainScreen {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: 'HI',
};

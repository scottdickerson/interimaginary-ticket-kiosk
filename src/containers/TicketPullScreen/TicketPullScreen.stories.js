import React from 'react';
import StoryRouter from 'storybook-react-router';
import TicketPullScreen from './TicketPullScreen';

const story = {
  title: 'components/TicketPullScreen',
  component: TicketPullScreen,
  decorators: [StoryRouter()],
};

export default story;

const Template = args => <TicketPullScreen {...args}></TicketPullScreen>;

export const Default = Template.bind({});

Default.args = {
  resetDelay: 3000,
};

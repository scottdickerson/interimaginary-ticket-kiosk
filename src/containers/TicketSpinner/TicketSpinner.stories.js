import React from 'react';
import StoryRouter from 'storybook-react-router';
import TicketSpinner from './TicketSpinner';

const story = {
  title: 'components/TicketSpinner',
  component: TicketSpinner,
  decorators: [StoryRouter()],
};

export default story;

const Template = args => <TicketSpinner {...args}></TicketSpinner>;

export const Default = Template.bind({});

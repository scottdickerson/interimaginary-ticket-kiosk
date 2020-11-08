import React from 'react';
import StoryRouter from 'storybook-react-router';
import TicketSurvey from './TicketSurvey';

const story = {
  title: 'components/TicketSurvey',
  component: TicketSurvey,
  decorators: [StoryRouter()],
};

export default story;

const Template = args => <TicketSurvey {...args}></TicketSurvey>;

export const Default = Template.bind({});

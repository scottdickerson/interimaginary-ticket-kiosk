import React from 'react';

import PullScreen from './PullScreen';
import TicketPullScreen from '../../containers/TicketPullScreen/TicketPullScreen';

const story = {
  title: 'components/PullScreen',
  component: PullScreen,
  argTypes: { onClick: { action: 'clicked' } },
};

export default story;

const Template = args => <PullScreen {...args}></PullScreen>;

export const Default = Template.bind({});

Default.args = {
  children: <TicketPullScreen />,
};

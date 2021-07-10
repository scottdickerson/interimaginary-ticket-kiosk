import BunnyAnimationRedux from './BunnyAnimationRedux';

const storyDef = {
  component: BunnyAnimationRedux,
  title: 'BunnyAnimationRedux',
  argTypes: {
    onFinished: { action: 'finished' },
  },
  args: {
    isStarted: true,
  },
};

export default storyDef;

export const Default = args => <BunnyAnimationRedux {...args} />;

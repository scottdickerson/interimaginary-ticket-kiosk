import GridChoiceRenderer from './GridChoiceRenderer';

const Default = {
  component: GridChoiceRenderer,
  title: 'component/GridChoiceRenderer',
  argTypes: {
    setIsProgressBarRunning: { action: 'setIsProgressBarRunning' },
    setSelectedChoice: { action: 'setSelectedChoice' },
    onSelection: { action: 'setSelectedChoice' },
  },
};

const choices = [
  'centaur',
  'djinn',
  'elf',
  'gnome',
  'goblin',
  'golem',
  'gremlin',
  'imp',
  'minotaur',
  'ogre',
  'orc',
  'pixie',
  'siren',
  'sorcerer',
  'sphinx',
  'sprite',
  'troll',
  'witch',
  'wizard',
  'yeti',
];

export const Standard = () => (
  <GridChoiceRenderer choices={choices} shouldAnimateBunny={false}></GridChoiceRenderer>
);

export default Default;

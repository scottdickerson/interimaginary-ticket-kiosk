import styles from '../src/App.module.css';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
  Story => (
    <div className={styles.app}>
      <Story />
    </div>
  ),
];

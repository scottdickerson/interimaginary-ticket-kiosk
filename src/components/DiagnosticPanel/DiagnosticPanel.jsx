import styles from './DiagnosticPanel.module.css';

const DiagnosticPanel = ({ isPrinterConfigured, isLoaded }) => {
  const indicator = !isLoaded
    ? styles.connecting
    : isPrinterConfigured
    ? styles.print
    : styles.digital;

  return isLoaded && !isPrinterConfigured ? (
    <div className={styles.panel}>
      <span className={`${styles.dot} ${indicator}`} />
      {/* <span className={styles.label}>{mode}</span> */}
    </div>
  ) : null;
};

export default DiagnosticPanel;

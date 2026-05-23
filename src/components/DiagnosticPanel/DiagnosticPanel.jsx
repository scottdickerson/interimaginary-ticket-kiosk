import styles from './DiagnosticPanel.module.css';

const DiagnosticPanel = ({ isPrinterConfigured, isLoaded }) => {
  const mode = !isLoaded
    ? 'connecting…'
    : isPrinterConfigured
    ? 'PRINT TICKET MODE'
    : 'DIGITAL TICKET MODE';
  const indicator = !isLoaded
    ? styles.connecting
    : isPrinterConfigured
    ? styles.print
    : styles.digital;

  return (
    <div className={styles.panel}>
      <span className={`${styles.dot} ${indicator}`} />
      <span className={styles.label}>{mode}</span>
    </div>
  );
};

export default DiagnosticPanel;

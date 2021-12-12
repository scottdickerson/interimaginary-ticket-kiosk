import back from './back.png';
import close from './close.png';
import styles from './Header.module.css';

const Header = ({ onBack, onClose }) => {
  return (
    <header className={styles.header}>
      {onBack ? (
        <button className={styles.surveyBackButton} onClick={onBack}>
          <img height={28} src={back} alt="back" />
        </button>
      ) : null}
      {onClose ? (
        <button className={styles.surveyButton} onClick={() => onClose()}>
          <img height={40} src={close} alt="close" />
        </button>
      ) : null}
    </header>
  );
};
export default Header;

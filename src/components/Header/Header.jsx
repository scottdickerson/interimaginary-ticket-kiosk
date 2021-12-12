import back from './back.png';
import close from './close.png';
import styles from './Header.module.css';

const Header = ({ onBack, onClose }) => {
  return (
    <header className={styles.header}>
      <button className={styles.surveyBackButton} onClick={onBack}>
        <img height={28} src={back} alt="back" />
      </button>
      <button className={styles.surveyButton} onClick={() => onClose()}>
        <img height={40} src={close} alt="close" />
      </button>
    </header>
  );
};
export default Header;

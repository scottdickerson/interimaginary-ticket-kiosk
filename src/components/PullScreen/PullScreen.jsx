import React from 'react';
import PropTypes from 'prop-types';

import styles from './PullScreen.module.css';

/** Component renders the children and handles clicking and resetting after a delay */
class PullScreen extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    resetDelay: PropTypes.number,
  };

  static defaultProps = {
    resetDelay: 360000,
  };

  componentDidMount() {
    this.touchListener = document.body.addEventListener('touchstart', this.resetTimer);
    this.clickListener = document.body.addEventListener('click', this.resetTimer);
  }
  resetTimer = () => {
    const { resetDelay, onReset } = this.props;
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(onReset, resetDelay);
  };

  render() {
    const { children, onClick } = this.props;
    return (
      <div className={styles.pullScreen} onClick={onClick}>
        {children}
      </div>
    );
  }
}

export default PullScreen;

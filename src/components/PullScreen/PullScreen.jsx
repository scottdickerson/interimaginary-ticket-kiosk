import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './PullScreen.module.css';

/** Component renders the children and handles clicking and resetting after a delay */
class PullScreen extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    resetDelay: PropTypes.number,
    isVisible: PropTypes.bool,
  };

  static defaultProps = {
    resetDelay: 45000,
    isVisible: true,
  };

  // componentDidMount() {
  //   this.touchListener = document.body.addEventListener('touchstart', this.resetTimer);
  //   this.clickListener = document.body.addEventListener('click', this.resetTimer);
  // }
  // resetTimer = () => {
  //   const { resetDelay, onReset } = this.props;
  //   clearTimeout(this.resetTimer);
  //   this.resetTimer = setTimeout(onReset, resetDelay);
  // };

  render() {
    const { children, onClick, isVisible } = this.props;
    return (
      <div
        className={classnames(styles.pullScreen, { [styles.isVisible]: isVisible })}
        onClick={onClick}>
        {children}
      </div>
    );
  }
}

export default PullScreen;

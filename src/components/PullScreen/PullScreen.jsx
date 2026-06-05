import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './PullScreen.module.css';

/** Component renders the children and handles clicking and resetting after a delay */
class PullScreen extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onReset: PropTypes.func.isRequired,
    resetDelay: PropTypes.number,
    isVisible: PropTypes.bool,
    inactivityTracking: PropTypes.bool,
  };

  static defaultProps = {
    resetDelay: 45000,
    isVisible: true,
    inactivityTracking: false,
  };

  componentDidMount() {
    this.syncInactivityTracking();
  }

  componentWillUnmount() {
    this.detachInactivityListeners();
    clearTimeout(this.resetTimer);
  }

  componentDidUpdate(prevProps) {
    this.syncInactivityTracking(prevProps);

    // Route/delay changes should not start a countdown — only user interaction should
    if (this.props.inactivityTracking && this.props.resetDelay !== prevProps.resetDelay) {
      clearTimeout(this.resetTimer);
      this.handleInactivity();
    }
  }

  syncInactivityTracking(prevProps = {}) {
    const tracking = this.props.inactivityTracking;
    const wasTracking = prevProps.inactivityTracking;

    if (tracking && !wasTracking) {
      this.attachInactivityListeners();
    } else if (!tracking && wasTracking) {
      this.detachInactivityListeners();
      clearTimeout(this.resetTimer);
    }
  }

  attachInactivityListeners() {
    if (this.touchListener) return;
    this.touchListener = () => this.handleInactivity();
    this.clickListener = () => this.handleInactivity();
    document.body.addEventListener('touchstart', this.touchListener);
    document.body.addEventListener('click', this.clickListener);
    // Start the timer immediately so the page always auto-resets even with no interaction
    this.handleInactivity();
  }

  detachInactivityListeners() {
    if (!this.touchListener) return;
    document.body.removeEventListener('touchstart', this.touchListener);
    document.body.removeEventListener('click', this.clickListener);
    this.touchListener = null;
    this.clickListener = null;
  }

  handleInactivity = () => {
    if (!this.props.inactivityTracking) return;

    const { resetDelay, onReset } = this.props;
    clearTimeout(this.resetTimer);
    console.log('resetting reset timer to: ', resetDelay, ' after user interaction');
    this.resetTimer = setTimeout(onReset, resetDelay);
  };

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

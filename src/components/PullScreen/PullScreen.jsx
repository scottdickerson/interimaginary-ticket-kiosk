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
  };

  static defaultProps = {
    resetDelay: 45000,
    isVisible: true,
  };

  componentDidMount() {
    this.touchListener = document.body.addEventListener('touchstart', this.handleReset);
    this.clickListener = document.body.addEventListener('click', this.handleReset);
  }

  componentWillUnmount() {
    document.body.removeEventListener('touchstart', this.touchListener);
    document.body.removeEventListener('click', this.clickListener);
  }
  // if the reset Delay changes then switch it
  componentDidUpdate(prevProps) {
    if (this.props.resetDelay !== prevProps.resetDelay) {
      console.log(
        'the reset delay switched so I am resetting the timer new reset delay: ',
        this.props.resetDelay
      );
      this.handleReset();
    }
  }
  handleReset = () => {
    const { resetDelay, onReset } = this.props;
    clearTimeout(this.resetTimer);
    console.log('resetting reset timer to: ', resetDelay, ' someone clicked or we switched pages');
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

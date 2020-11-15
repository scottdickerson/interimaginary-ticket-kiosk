import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './Button.module.css';

const propTypes = {
  /** callback to use when button is clicked */
  onClick: PropTypes.func.isRequired,
  /** label inside button */
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
};

const Button = ({ onClick, children, disabled, selected }) => {
  return (
    <button
      className={classnames(styles.button, {
        [styles.disabled]: disabled,
        [styles.selected]: selected,
      })}
      onClick={onClick}>
      {children}
    </button>
  );
};

Button.propTypes = propTypes;
export default Button;

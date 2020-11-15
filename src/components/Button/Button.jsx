import React from 'react';
import PropTypes from 'prop-types';

import styles from './Button.module.css';

const propTypes = {
  /** callback to use when button is clicked */
  onClick: PropTypes.func.isRequired,
  /** label inside button */
  children: PropTypes.node.isRequired,
};

const Button = ({ onClick, children }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {children}
    </button>
  );
};

Button.propTypes = propTypes;
export default Button;

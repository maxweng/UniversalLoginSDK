import React from 'react';
import PropTypes from 'prop-types';

const BackBtn = (props) => (
  <button onClick={() => props.setView('MainScreen')} className="btn header-btn">
    返回
  </button>
);

BackBtn.propTypes = {
  setView: PropTypes.func
};

export default BackBtn;

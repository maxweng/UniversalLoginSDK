import React from 'react';
import PropTypes from 'prop-types';

const AccountLink = (props) => (
  <div>
  <button onClick={() => props.setView('Account')} className="btn header-btn">
    Account
  </button>
  <button onClick={() => props.setView('CoinCenter')} className="btn header-btn">
    积分中心
  </button>
</div>
);

AccountLink.propTypes = {
  setView: PropTypes.func
};

export default AccountLink;

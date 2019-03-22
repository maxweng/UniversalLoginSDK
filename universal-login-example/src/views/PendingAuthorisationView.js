import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {filterIP} from '../utils';

class PendingAuthorisationView extends Component {
  render() {
    return (
      <div>
        <br />
        <p
          className="pending-authorizations-text"
          key={this.props.authorisation.key}
        >
          有人请求登录此应用程序从{' '}
          <span className="bold">{this.props.authorisation.deviceInfo.browser}</span>{' '}
          浏览器 {' '}
          <span className="bold">{this.props.authorisation.deviceInfo.name}</span>,
          来自 IP{' '}
          <span className="bold">
            {filterIP(this.props.authorisation.deviceInfo.ipAddress)} (
            {this.props.authorisation.deviceInfo.city})
          </span>{' '}
          于 <span className="bold">{this.props.authorisation.deviceInfo.time}</span>
        </p>
        <button
          className="btn-alt fullwidth"
          onClick={() => this.props.onAcceptClick(this.props.authorisation.key)}
        >
          接受请求 <br />
          <span className="click-cost">花费 1 click</span>
        </button>
        <button
          className="btn fullwidth"
          onClick={() => this.props.onDenyClick(this.props.authorisation.key)}
        >
          拒绝请求
        </button>{' '}
      </div>
    );
  }
}

PendingAuthorisationView.propTypes = {
  authorisation: PropTypes.object,
  onAcceptClick: PropTypes.func,
  onDenyClick: PropTypes.func
};

export default PendingAuthorisationView;

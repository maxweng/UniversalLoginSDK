import React, {Component} from 'react';
import HeaderView from '../views/HeaderView';
import BackToAppBtn from './BackToAppBtn';
import ProfileIdentity from './ProfileIdentity';
import ManageDevicesAccordion from './ManageDevicesAccordion';
import BackupCodeAccordionView from '../views/BackupCodeAccordionView';
import SettingsAccordion from './SettingsAccordion';
import PropTypes from 'prop-types';

class Account extends Component {
  constructor(props) {
    super(props);
    this.emitter = this.props.identityService.emitter;
  }

  setView(view) {
    this.emitter.emit('setView', view);
  }

  onDisconnectClick() {
    if (
      confirm(
        '注意：断开此设备而不进行其他备份将导致您的帐户永久无法访问！ 你确定要继续吗？'
      )
    ) {
      this.props.identityService.disconnect();
      this.emitter.emit('setView', 'Login');
    }
  }

  render() {
    let close = this.props.close;

    return (
      <div className="account">
        <div className="container">
          <ProfileIdentity
            type="identityAccount"
            identityService={this.props.identityService}
          />
          <hr className="separator" />
          <ManageDevicesAccordion
            onDisconnectClick={this.onDisconnectClick.bind(this)}
            emitter={this.props.identityService.emitter}
          />
          <hr className="separator" />
          <BackupCodeAccordionView setView={this.setView.bind(this)} />
          <hr className="separator" />
          <SettingsAccordion />
          <hr className="separator" />
        </div>
      </div>
    );
  }
}
Account.propTypes = {
  identityService: PropTypes.object
};

export default Account;

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
        'ATTENTION: disconnecting this device without other backups will result in making your account permanently unacessible! Are you sure you want to proceed?'
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
        <HeaderView>
          {/* <BackToAppBtn setView={this.setView.bind(this)} /> */}
          <button onClick={close} className="btn header-btn">
            BACK
          </button>
        </HeaderView>
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

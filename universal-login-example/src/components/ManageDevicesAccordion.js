import React, {Component} from 'react';
import Collapsible from './Collapsible';
import ManageDevicesAccordionView from '../views/ManageDevicesAccordionView';
import PropTypes from 'prop-types';

const devices = [
  // {
  //   name: 'Mockup device',
  //   status: 'Feature not ye'
  // },
  // {
  //   name: 'Chrome on Windows',
  //   status: 'Last seen: a few minutes ago'
  // },
  // {
  //   name: 'Status app on iOS',
  //   status: 'Last seen: 8 days ago'
  // }
];

class ManageDevices extends Component {
  removeDevice() {
    if (
      confirm(
        '如果您没有其他工作设备或恢复选项，您将永久失去对此帐户的访问权限. 花费 1 click'
      )
    ) {
      // TODO: actually key from the contract
    }
  }

  render() {
    return (
      <Collapsible
        title="管理设备"
        subtitle="您目前有3个授权设备"
        icon="icon-smartphone"
      >
        <ManageDevicesAccordionView
          devices={devices}
          removeDevice={this.removeDevice.bind(this)}
          onDisconnectClick={this.props.onDisconnectClick.bind(this)}
        />
      </Collapsible>
    );
  }
}

ManageDevices.propTypes = {
  onDisconnectClick: PropTypes.func
};

export default ManageDevices;

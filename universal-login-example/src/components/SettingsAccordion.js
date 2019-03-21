import React, {Component} from 'react';
import Collapsible from './Collapsible';
import SettingsAccordionView from '../views/SettingsAccordionView';

class SettingsAccordion extends Component {
  render() {
    return (
      <Collapsible
        title="更多设置"
        subtitle="进行更改所需的设备数量"
        icon="icon-settings"
      >
        <SettingsAccordionView />
      </Collapsible>
    );
  }
}

export default SettingsAccordion;

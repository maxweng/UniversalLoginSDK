import React from 'react';
import Collapsible from '../components/Collapsible';
import PropTypes from 'prop-types';

const BackupCodeAccordionView = (props) => (
  <Collapsible
    title="备份代码"
    subtitle="备份您的帐户"
    icon="icon-printer"
  >
    <p className="advice-text">
    如果您丢失了所有设备，则可能没有其他方法可以恢复您的帐户。 生成恢复代码并确保安全
    </p>
    <button onClick={() => props.setView('Backup')} className="btn fullwidth">
    生成新代码
    </button>
  </Collapsible>
);

BackupCodeAccordionView.propTypes = {
  setView: PropTypes.func
};

export default BackupCodeAccordionView;

import React from 'react';

const SettingsAccordionView = () => (
  <div>
    <div className="dropdown setting">
      <p>添加和删除新帐户：</p>
      <button className="dropdown-btn setting-dropdown-btn">2 设备</button>
    </div>
    <div className="dropdown setting">
      <p>其他行为：</p>
      <button className="dropdown-btn setting-dropdown-btn">1 设备</button>
    </div>
    <button className="btn fullwidth">保存新设置</button>
    <p className="click-cost">
      <em>花费 2 klik</em>
    </p>
  </div>
);

export default SettingsAccordionView;

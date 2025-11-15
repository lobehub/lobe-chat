'use client';

import { App } from 'antd';
import { memo } from 'react';
import { Outlet } from 'react-router-dom';

const MobileKnowledgeLayout = memo(() => {
  return (
    <App style={{ display: 'flex', flex: 1, height: '100%' }}>
      <Outlet />
    </App>
  );
});

MobileKnowledgeLayout.displayName = 'MobileKnowledgeLayout';

export default MobileKnowledgeLayout;

'use client';

import { App } from 'antd';
import { memo } from 'react';
import { Outlet } from 'react-router-dom';

const DesktopKnowledgeLayout = memo(() => {
  return (
    <App style={{ display: 'flex', flex: 1, height: '100%' }}>
      <Outlet />
    </App>
  );
});

DesktopKnowledgeLayout.displayName = 'DesktopKnowledgeLayout';

export default DesktopKnowledgeLayout;

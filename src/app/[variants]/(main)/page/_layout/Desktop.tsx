'use client';

import { App } from 'antd';
import { memo } from 'react';
import { Outlet } from 'react-router-dom';

const DesktopPagesLayout = memo(() => {
  return (
    <App style={{ display: 'flex', flex: 1, height: '100%' }}>
      <Outlet />
    </App>
  );
});

DesktopPagesLayout.displayName = 'DesktopPagesLayout';

export default DesktopPagesLayout;

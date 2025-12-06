'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

const DesktopPagesLayout = memo(() => {
  const theme = useTheme();

  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100%'}
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Outlet />
      </Flexbox>
    </>
  );
});

DesktopPagesLayout.displayName = 'DesktopPagesLayout';

export default DesktopPagesLayout;

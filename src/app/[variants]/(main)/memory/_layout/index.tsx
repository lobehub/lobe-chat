'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

const DesktopMemoryLayout = memo(() => {
  const theme = useTheme();

  return (
    <Flexbox
      flex={1}
      height={'100%'}
      style={{
        background: theme.colorBgContainer,
        overflow: 'auto',
        padding: 24,
        position: 'relative',
      }}
    >
      <Outlet />
    </Flexbox>
  );
});

DesktopMemoryLayout.displayName = 'DesktopMemoryLayout';

export default DesktopMemoryLayout;

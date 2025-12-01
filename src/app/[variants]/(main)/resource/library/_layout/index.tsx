'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import RegisterHotkeys from '@/app/[variants]/(main)/resource/library/features/RegisterHotkeys';

import Sidebar from './Sidebar';

const LibraryLayout = memo(() => {
  const theme = useTheme();

  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100vh'}
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Outlet />
      </Flexbox>
      <RegisterHotkeys />
    </>
  );
});

LibraryLayout.displayName = 'ResourceLibraryLayout';

export default LibraryLayout;

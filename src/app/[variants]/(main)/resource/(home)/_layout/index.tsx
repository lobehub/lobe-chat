'use client';

import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

const HomeLayout: FC = () => {
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
};

HomeLayout.displayName = 'ResourceHomeLayout';

export default HomeLayout;

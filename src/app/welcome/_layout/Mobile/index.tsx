'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

import AppLayoutMobile from '@/layout/GlobalLayout/Mobile/Client';

import Header from './Header';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <AppLayoutMobile navBar={<Header />} showTabBar style={{ background: theme.colorBgLayout }}>
      <div style={{ height: '100%', paddingInline: 16 }}>{children}</div>
    </AppLayoutMobile>
  );
});

export default MobileLayout;

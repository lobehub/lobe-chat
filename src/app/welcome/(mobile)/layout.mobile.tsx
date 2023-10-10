'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

import Header from './features/Header';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <AppLayoutMobile navBar={<Header />} showTabBar style={{ background: theme.colorBgLayout }}>
      <div style={{ height: '100%', paddingInline: 16 }}>{children}</div>
    </AppLayoutMobile>
  );
});

export default MobileLayout;

'use client';

import { Logo, MobileNavBar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <AppMobileLayout
      navBar={<MobileNavBar center={<Logo type={'text'} />} />}
      showTabBar
      style={{ background: theme.colorBgLayout }}
    >
      {children}
    </AppMobileLayout>
  );
});

export default MobileLayout;

'use client';

import { Logo, MobileNavBar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <AppLayoutMobile
      navBar={<MobileNavBar center={<Logo type={'text'} />} />}
      showTabBar
      style={{ background: theme.colorBgLayout }}
    >
      {children}
    </AppLayoutMobile>
  );
});

export default MobileLayout;

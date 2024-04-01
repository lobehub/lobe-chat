'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientResponsiveLayout from '@/components/client/ClientResponsiveLayout';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useIsPWA } from '@/hooks/useIsPWA';

import SideBar from './SideBar';

const Desktop = memo<PropsWithChildren>(({ children }) => {
  const isPWA = useIsPWA();
  const theme = useTheme();

  const sidebarKey = useActiveTabKey();

  return (
    <Flexbox
      height={'100%'}
      horizontal
      style={isPWA ? { borderTop: `1px solid ${theme.colorBorder}` } : {}}
      width={'100%'}
    >
      <SideBar sidebarKey={sidebarKey} />
      {children}
    </Flexbox>
  );
});

export default ClientResponsiveLayout({ Desktop, Mobile: () => import('../Mobile') });

'use client';

import { useTheme } from 'antd-style';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientResponsiveLayout from '@/components/client/ClientResponsiveLayout';
import { useIsPWA } from '@/hooks/useIsPWA';
import { SidebarTabKey } from '@/store/global/initialState';

import SideBar from './SideBar';

const Desktop = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();

  const isPWA = useIsPWA();
  const theme = useTheme();

  const sidebarKey = pathname.split('/').find(Boolean)! as SidebarTabKey;

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

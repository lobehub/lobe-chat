'use client';

import { useTheme } from 'antd-style';
import { usePathname } from 'next/navigation';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsPWA } from '@/hooks/useIsPWA';
import { SidebarTabKey } from '@/store/global/initialState';

import SideBar from './SideBar';

interface AppLayoutDesktopProps {
  children: ReactNode;
  sidebarKey?: SidebarTabKey;
}
const Client = memo<AppLayoutDesktopProps>(({ children }) => {
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

export default Client;

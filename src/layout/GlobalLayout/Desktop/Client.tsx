'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { FC, PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientLayout from '@/components/client/ClientLayout';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';
import { useIsPWA } from '@/hooks/useIsPWA';
import { SidebarTabKey } from '@/store/global/initialState';

import SideBar from './SideBar';

const Mobile = dynamic(() => import('../Mobile'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC<PropsWithChildren>;

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

export default ClientLayout({ Desktop, Mobile });

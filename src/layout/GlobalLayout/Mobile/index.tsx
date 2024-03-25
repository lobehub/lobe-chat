'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarTabKey } from '@/store/global/initialState';

import ChatHeader from './ChatHeader';
import AppLayoutMobile from './Client';
import MarketHeader from './MarketHeader';
import SessionHeader from './SessionHeader';
import SettingHeader from './SettingHeader';
import SettingSubPageHeader from './SettingSubPageHeader';

const MobileLayout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  const slugs = pathname.split('/').filter(Boolean);
  const sidebarKey = slugs[0] as SidebarTabKey;
  const isSubPath = slugs.length > 1;

  const header = useMemo(() => {
    if (pathname === '/chat') return <SessionHeader />;
    if (pathname === '/chat/mobile') return <ChatHeader />;
    if (pathname === '/settings') return <SettingHeader />;
    if (pathname === '/market') return <MarketHeader />;
    if (pathname.startsWith('/settings')) return <SettingSubPageHeader />;
  }, [pathname]);

  return (
    <AppLayoutMobile navBar={header} showTabBar={!isSubPath} tabBarKey={sidebarKey}>
      {children}
    </AppLayoutMobile>
  );
};

export default MobileLayout;

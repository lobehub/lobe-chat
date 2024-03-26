'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo, useMemo } from 'react';

import { SidebarTabKey } from '@/store/global/initialState';

import ChatHeader from './ChatHeader';
import AppLayoutMobile from './Client';
import SettingHeader from './DefaultHeader';
import MarketHeader from './MarketHeader';
import SessionHeader from './SessionHeader';
import SettingSubPageHeader from './SettingSubPageHeader';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();

  const slugs = pathname.split('/').filter(Boolean);
  const sidebarKey = slugs[0] as SidebarTabKey;
  const isSubPath = slugs.length > 1;

  const header = useMemo(() => {
    if (['/settings', '/welcome'].includes(pathname)) return <SettingHeader />;
    if (pathname === '/chat') return <SessionHeader />;
    if (pathname === '/chat/mobile') return <ChatHeader />;
    if (pathname === '/market') return <MarketHeader />;
    if (pathname.startsWith('/settings')) return <SettingSubPageHeader />;
  }, [pathname]);

  if (pathname === '/') return children;

  return (
    <AppLayoutMobile navBar={header} showTabBar={!isSubPath} tabBarKey={sidebarKey}>
      {children}
    </AppLayoutMobile>
  );
});

export default MobileLayout;

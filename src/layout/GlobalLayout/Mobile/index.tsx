'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarTabKey } from '@/store/global/initialState';

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

  const Header = useMemo(() => {
    switch (sidebarKey) {
      case SidebarTabKey.Chat: {
        return SessionHeader;
      }

      case SidebarTabKey.Market: {
        return MarketHeader;
      }

      case SidebarTabKey.Setting: {
        return SettingHeader;
      }
    }
  }, [sidebarKey]);

  return (
    <AppLayoutMobile
      navBar={isSubPath ? <SettingSubPageHeader /> : <Header />}
      showTabBar={!isSubPath}
      tabBarKey={sidebarKey}
    >
      {children}
    </AppLayoutMobile>
  );
};

export default MobileLayout;

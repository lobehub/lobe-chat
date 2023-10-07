'use client';

import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import DetailModal from './AgentDetail';
import Header from './Header';

const MarketLayout = ({ children }: PropsWithChildren) => {
  useSwitchSideBarOnInit(SidebarTabKey.Market);

  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        {children}
      </Flexbox>
      <DetailModal />
    </AppMobileLayout>
  );
};

export default MarketLayout;

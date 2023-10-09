'use client';

import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import DetailModal from './features/AgentDetail';
import Header from './features/Header';

const MarketLayout = ({ children }: PropsWithChildren) => {
  useSwitchSideBarOnInit(SidebarTabKey.Market);

  return (
    <AppLayoutMobile navBar={<Header />} showTabBar>
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        {children}
      </Flexbox>
      <DetailModal />
    </AppLayoutMobile>
  );
};

export default MarketLayout;

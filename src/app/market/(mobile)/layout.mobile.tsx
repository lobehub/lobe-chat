'use client';

import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { SidebarTabKey } from '@/store/global/initialState';

import Header from './features/Header';

const DetailModal = dynamic(() => import('./features/AgentDetail'));

const MarketLayout = ({ children }: PropsWithChildren) => {
  return (
    <AppLayoutMobile navBar={<Header />} showTabBar tabBarKey={SidebarTabKey.Market}>
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        {children}
      </Flexbox>
      <DetailModal />
    </AppLayoutMobile>
  );
};

export default MarketLayout;

import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';
import SideBar from '@/pages/market/features/SideBar';

import Header from './features/Header';

const MarketLayout = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        {children}
      </Flexbox>
      <SideBar />
    </AppMobileLayout>
  );
});

export default MarketLayout;

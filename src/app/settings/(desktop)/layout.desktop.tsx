'use client';

import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import SideBar from '../features/SideBar';
import Header from './features/Header';

export default memo(({ children }: PropsWithChildren) => {
  useSwitchSideBarOnInit(SidebarTabKey.Setting);
  return (
    <AppLayoutDesktop>
      <SideBar />
      <Flexbox flex={1} height={'100%'} style={{ position: 'relative' }}>
        <Header />
        <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'auto' }}>
          <SafeSpacing />
          <Center gap={16} width={'100%'}>
            {children}
          </Center>
        </Flexbox>
      </Flexbox>
    </AppLayoutDesktop>
  );
});

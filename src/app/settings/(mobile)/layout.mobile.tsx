'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import Header from './features/Header';

export default memo(({ children }: PropsWithChildren) => {
  useSwitchSideBarOnInit(SidebarTabKey.Setting);
  return (
    <AppLayoutMobile navBar={<Header />}>
      <Flexbox style={{ overflow: 'auto' }}>{children}</Flexbox>
    </AppLayoutMobile>
  );
});

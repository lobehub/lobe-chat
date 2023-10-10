'use client';

import { PropsWithChildren, memo } from 'react';

import SessionHeader from '@/app/chat/(mobile)/features/SessionHeader';
import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

export default memo(({ children }: PropsWithChildren) => {
  useSwitchSideBarOnInit(SidebarTabKey.Chat);
  return (
    <AppLayoutMobile navBar={<SessionHeader />} showTabBar>
      {children}
    </AppLayoutMobile>
  );
});

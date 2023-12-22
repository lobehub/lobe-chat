'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import ResponsiveSessionList from './features/SessionList';

/**
 * 针对桌面端设计的整个聊天页面的布局
 *
 * @author dongjak
 */
export default memo(({ children }: PropsWithChildren) => {
  useSwitchSideBarOnInit(SidebarTabKey.Chat);
  return (
    <AppLayoutDesktop>
      <ResponsiveSessionList />
      <Flexbox
        flex={1}
        height={'100%'}
        id={'lobe-conversion-container'}
        style={{ position: 'relative' }}
      >
        {children}
      </Flexbox>
    </AppLayoutDesktop>
  );
});

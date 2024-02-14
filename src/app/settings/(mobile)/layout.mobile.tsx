'use client';

import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

import Header from './features/Header';

export interface SettingLayoutProps {
  activeTab: SettingsTabs;
  children: ReactNode;
}
export default memo(({ children, activeTab }: SettingLayoutProps) => {
  useSwitchSideBarOnInit(SidebarTabKey.Setting);
  return (
    <AppLayoutMobile navBar={<Header activeTab={activeTab} />}>
      <Flexbox style={{ overflow: 'auto' }}>{children}</Flexbox>
    </AppLayoutMobile>
  );
});

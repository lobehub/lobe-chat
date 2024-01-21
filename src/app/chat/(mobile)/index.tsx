'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/slices/common/initialState';

import PageTitle from '../features/PageTitle';
import SessionHeader from './features/SessionHeader';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  useSwitchSideBarOnInit(SidebarTabKey.Chat);

  const router = useRouter();
  useEffect(() => {
    router.prefetch('/chat/mobile');
    router.prefetch('/settings');
  }, []);

  return (
    <AppLayoutMobile navBar={<SessionHeader />} showTabBar>
      <PageTitle />
      <SessionList />
    </AppLayoutMobile>
  );
});

export default ChatMobilePage;

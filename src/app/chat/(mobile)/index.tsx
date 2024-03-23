'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';
import { SidebarTabKey } from '@/store/global/initialState';

import PageTitle from '../features/PageTitle';
import SessionHeader from './features/SessionHeader';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  const router = useRouter();
  useEffect(() => {
    router.prefetch('/chat/mobile');
    router.prefetch('/settings');
  }, []);

  return (
    <AppLayoutMobile navBar={<SessionHeader />} showTabBar tabBarKey={SidebarTabKey.Chat}>
      <PageTitle />
      <SessionList />
    </AppLayoutMobile>
  );
});

export default ChatMobilePage;

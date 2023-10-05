'use client';

import { memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';

import PageTitle from '../features/PageTitle';
import SessionHeader from './features/SessionHeader';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  return (
    <AppMobileLayout navBar={<SessionHeader />} showTabBar>
      <PageTitle />
      <SessionList />
    </AppMobileLayout>
  );
});

export default ChatMobilePage;

'use client';

import { memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Header from './features/SessionHeader';
import SessionList from './features/SessionList';

const ChatMobilePage = memo(() => {
  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <SessionList />
    </AppMobileLayout>
  );
});

export default ChatMobilePage;

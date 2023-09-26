import { memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';
import { useSwitchSideBarOnInit } from '@/store/global';

import { Sessions } from './features/SessionList';
import Header from './features/SessionList/Header';

const ChatMobileLayout = memo(() => {
  useSwitchSideBarOnInit('chat');

  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <Sessions />
    </AppMobileLayout>
  );
});

export default ChatMobileLayout;

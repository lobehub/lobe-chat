import { ReactNode, memo } from 'react';
import { Center } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';
import { useSwitchSideBarOnInit } from '@/store/global';

import Header from './features/Header';

const ChatMobileLayout = memo<{ children: ReactNode }>(({ children }) => {
  useSwitchSideBarOnInit('chat');

  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <Center flex={1}>{children}</Center>
    </AppMobileLayout>
  );
});

export default ChatMobileLayout;

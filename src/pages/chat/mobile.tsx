import { useTheme } from 'antd-style';
import { memo } from 'react';

import AppMobileLayout from '@/layout/AppMobileLayout';
import { useSwitchSideBarOnInit } from '@/store/global';

import { Sessions } from './features/SessionList';
import Header from './features/SessionList/Header';

const ChatMobileLayout = memo(() => {
  useSwitchSideBarOnInit('chat');
  const theme = useTheme();

  return (
    <AppMobileLayout
      navBar={<Header mobile={'navbar'} />}
      showTabBar
      style={{ background: theme.colorBgContainer }}
    >
      <Sessions mobile />
    </AppMobileLayout>
  );
});

export default ChatMobileLayout;

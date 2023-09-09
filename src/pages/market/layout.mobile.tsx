import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';

import AgentSearchBar from './features/AgentSearchBar';
import Header from './features/Header';

const ChatMobileLayout = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <AppMobileLayout navBar={<Header />} showTabBar>
      <div style={{ padding: '8px 16px 0' }}>
        <AgentSearchBar />
      </div>
      <Flexbox flex={1} style={{ padding: 16 }}>
        {children}
      </Flexbox>
    </AppMobileLayout>
  );
});

export default ChatMobileLayout;

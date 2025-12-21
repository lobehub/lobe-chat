'use client';

import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import AgentIdSync from '@/app/[variants]/(main)/chat/_layout/AgentIdSync';
import ChatHeader from '@/app/[variants]/(mobile)/chat/features/ChatHeader';
import MobileContentLayout from '@/components/server/MobileNavLayout';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

const Layout: FC = () => {
  useInitAgentConfig();

  return (
    <>
      <MobileContentLayout header={<ChatHeader />} style={{ overflowY: 'hidden' }}>
        <Outlet />
      </MobileContentLayout>
      <AgentIdSync />
    </>
  );
};

Layout.displayName = 'MobileChatLayout';

export default Layout;

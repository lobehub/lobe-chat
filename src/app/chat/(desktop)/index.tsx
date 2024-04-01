'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';

import ChatHeader from './features/ChatHeader';
import Conversation from './features/Conversation';
import SideBar from './features/SideBar';

const Desktop = memo(() => (
  <>
    <ChatHeader />
    <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
      <Conversation />
      <SideBar />
    </Flexbox>
  </>
));

export default ClientResponsiveContent({ Desktop, Mobile: () => import('../(mobile)') });

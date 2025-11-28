'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import Conversation from './features/Conversation';
import PageTitle from './features/PageTitle';
import Portal from './features/Portal';
import TelemetryNotification from './features/TelemetryNotification';

const ChatPage = memo(() => {
  useInitAgentConfig();
  return (
    <>
      <PageTitle />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Conversation />
        <Portal />
      </Flexbox>
      <MainInterfaceTracker />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export default ChatPage;

'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';

import Conversation from './Conversation';
import Portal from './Portal';
import Sidebar from './Sidebar';
import PageTitle from './features/PageTitle';
import TelemetryNotification from './features/TelemetryNotification';

const ChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Sidebar />
        <Conversation />
        <Portal />
      </Flexbox>
      <MainInterfaceTracker />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export default ChatPage;

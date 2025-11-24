'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';

import Conversation from './conversation';
import PageTitle from './features/PageTitle';
import TelemetryNotification from './features/TelemetryNotification';
import Portal from './portal';
import Topic from './topic';

const DesktopChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Topic />
        <Conversation />
        <Portal />
      </Flexbox>
      <MainInterfaceTracker />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export default DesktopChatPage;

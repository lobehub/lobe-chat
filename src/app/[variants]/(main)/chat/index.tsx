'use client';

import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ChatHeader from '@/app/[variants]/(main)/chat/features/ChatHeader';
import Portal from '@/app/[variants]/(main)/chat/portal/features/Portal';
import TopicPanel from '@/app/[variants]/(main)/chat/topic/features/TopicPanel';
import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import BrandTextLoading from '@/components/Loading/BrandTextLoading';

import ConversationArea from './conversation/features/ConversationArea';
import PageTitle from './features/PageTitle';
import TelemetryNotification from './features/TelemetryNotification';
import PortalPanel from './portal/features/PortalPanel';
import TopicSidebar from './topic/features/TopicSidebar';

const DesktopChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <ChatHeader />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <TopicPanel>
          <TopicSidebar mobile={false} />
        </TopicPanel>
        <Flexbox
          height={'100%'}
          style={{ overflow: 'hidden', position: 'relative' }}
          width={'100%'}
        >
          <ConversationArea mobile={false} />
        </Flexbox>
        <Portal>
          <Suspense fallback={<BrandTextLoading />}>
            <PortalPanel mobile={false} />
          </Suspense>
        </Portal>
      </Flexbox>
      <MainInterfaceTracker />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export default DesktopChatPage;

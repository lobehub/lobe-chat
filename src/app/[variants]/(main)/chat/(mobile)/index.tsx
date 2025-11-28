'use client';

import { memo } from 'react';

import ConversationArea from '@/app/[variants]/(main)/chat/features/Conversation/ConversationArea';
import PortalPanel from '@/app/[variants]/(main)/chat/features/Portal/features/PortalPanel';
import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import PageTitle from '../features/PageTitle';
import TelemetryNotification from '../features/TelemetryNotification';
import ChatHeader from './features/ChatHeader';
import Topic from './topic';

const MobileChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <MobileContentLayout header={<ChatHeader />} style={{ overflowY: 'hidden' }}>
        <ConversationArea mobile />
      </MobileContentLayout>
      <Topic />
      <PortalPanel mobile />
      <MainInterfaceTracker />
      <TelemetryNotification mobile={true} />
    </>
  );
});

export default MobileChatPage;

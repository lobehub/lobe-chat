'use client';

import { memo } from 'react';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import ConversationArea from '../conversation/features/ConversationArea';
import PageTitle from '../features/PageTitle';
import TelemetryNotification from '../features/TelemetryNotification';
import PortalPanel from '../portal/features/PortalPanel';
import TopicSidebar from '../topic/features/TopicSidebar';
import ChatHeader from './features/ChatHeader';
import TopicModal from './features/TopicModal';

const MobileChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <MobileContentLayout header={<ChatHeader />} style={{ overflowY: 'hidden' }}>
        <ConversationArea mobile />
      </MobileContentLayout>
      <TopicModal>
        <TopicSidebar mobile />
      </TopicModal>
      <PortalPanel mobile />
      <MainInterfaceTracker />
      <TelemetryNotification mobile={true} />
    </>
  );
});

export default MobileChatPage;

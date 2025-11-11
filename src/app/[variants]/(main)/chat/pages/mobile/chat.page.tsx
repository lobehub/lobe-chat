'use client';

import { memo } from 'react';

import TelemetryNotification from '../../components/features/TelemetryNotification';
import PageTitle from '../../features/PageTitle';

import MainInterfaceTracker from '@/components/Analytics/MainInterfaceTracker';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import ChatHeaderMobile from '../../components/layout/Mobile/ChatHeader';
import TopicModal from '../../components/layout/Mobile/TopicModal';
import ConversationArea from '../../components/ConversationArea';
import PortalPanel from '../../components/PortalPanel';
import TopicSidebar from '../../components/TopicSidebar';


export const MobileChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <MobileContentLayout header={<ChatHeaderMobile />} style={{ overflowY: 'hidden' }}>
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

MobileChatPage.displayName = 'MobileChatPage';

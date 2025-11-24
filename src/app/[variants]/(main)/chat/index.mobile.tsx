'use client';

import { memo } from 'react';

import ConversationArea from './components/ConversationArea';
import PortalPanel from './components/PortalPanel';
import TopicSidebar from './components/TopicSidebar';
import MobileLayout from './components/_layout/Mobile';
import TelemetryNotification from './components/features/TelemetryNotification';
import PageTitle from './features/PageTitle';

const MobileChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <MobileLayout
        conversation={<ConversationArea mobile />}
        portal={<PortalPanel mobile />}
        topic={<TopicSidebar mobile />}
      />
      <TelemetryNotification mobile={true} />
    </>
  );
});

export default MobileChatPage;

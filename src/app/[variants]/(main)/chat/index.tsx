'use client';

import { memo } from 'react';

import TelemetryNotification from './components/features/TelemetryNotification';
import PageTitle from './features/PageTitle';
import WorkspaceLayout from './components/WorkspaceLayout';

const MobileChatPage = memo(() => {
  return (
    <>
       <PageTitle />
      <WorkspaceLayout mobile={true} />
      <TelemetryNotification mobile={true} />
    </>
  );
});

const DesktopChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <WorkspaceLayout mobile={false} />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export { DesktopChatPage,MobileChatPage };
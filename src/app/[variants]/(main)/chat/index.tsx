'use client';

import { memo } from 'react';

import { DesktopWorkspace, MobileWorkspace } from './components/WorkspaceLayout';
import TelemetryNotification from './components/features/TelemetryNotification';
import PageTitle from './features/PageTitle';

const MobileChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <MobileWorkspace />
      <TelemetryNotification mobile={true} />
    </>
  );
});

const DesktopChatPage = memo(() => {
  return (
    <>
      <PageTitle />
      <DesktopWorkspace />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export { DesktopChatPage, MobileChatPage };

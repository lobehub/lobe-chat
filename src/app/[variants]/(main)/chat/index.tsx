'use client';

import { memo, useEffect, useState } from 'react';

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

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log('DesktopChatPage');
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <PageTitle />
      <DesktopWorkspace />
      <TelemetryNotification mobile={false} />
    </>
  );
});

export { DesktopChatPage, MobileChatPage };

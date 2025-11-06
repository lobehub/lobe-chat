'use client';

import { memo } from 'react';

import TelemetryNotification from '../components/features/TelemetryNotification';
import PageTitle from '../features/PageTitle';
import WorkspaceLayout from './WorkspaceLayout';

interface MainChatPageProps {
  mobile?: boolean;
}

const MainChatPage = memo<MainChatPageProps>(({ mobile }) => {
  return (
    <>
      <PageTitle />
      <WorkspaceLayout mobile={mobile} />
      <TelemetryNotification mobile={mobile} />
    </>
  );
});

MainChatPage.displayName = 'MainChatPage';

export default MainChatPage;

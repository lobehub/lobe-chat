'use client';

import { Suspense, memo } from 'react';

import { isDesktop } from '@/const/version';

import Changelog from '../(workspace)/features/ChangelogModal';
import TelemetryNotification from '../(workspace)/features/TelemetryNotification';
import PageTitle from '../features/PageTitle';
import WorkspaceLayout from './WorkspaceLayout';

interface MainChatPageProps {
  mobile?: boolean;
  showChangelog?: boolean;
  hideDocs?: boolean;
}

const MainChatPage = memo<MainChatPageProps>(({ mobile, showChangelog, hideDocs }) => {
  return (
    <>
      <PageTitle />
      <WorkspaceLayout mobile={mobile} />
      <TelemetryNotification mobile={mobile} />
      {!isDesktop && showChangelog && !hideDocs && !mobile && (
        <Suspense>
          <Changelog />
        </Suspense>
      )}
    </>
  );
});

MainChatPage.displayName = 'MainChatPage';

export default MainChatPage;

import { lazy, memo } from 'react';

import SessionHydration from '@/app/[variants]/(main)/chat/(mobile)/session/SessionHydration';
import MobileLayout from '@/app/[variants]/(main)/chat/(mobile)/session/layout';

const SessionListContent = lazy(() => import('./SessionListContent'));

const SessionPanel = memo(() => {
  return (
    <>
      <MobileLayout>
        <SessionListContent />
      </MobileLayout>
      <SessionHydration />
    </>
  );
});

SessionPanel.displayName = 'SessionPanel';

export default SessionPanel;

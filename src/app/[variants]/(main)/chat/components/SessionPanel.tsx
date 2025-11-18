import { lazy, memo } from 'react';

import SessionHydration from '../session/features/SessionHydration';
import DesktopLayout from '../session/layout/Desktop';
import MobileLayout from '../session/layout/Mobile';

const SessionListContent = lazy(() => import('../session/features/SessionListContent'));

interface SessionPanelProps {
  mobile?: boolean;
}

const SessionPanel = memo<SessionPanelProps>(({ mobile }) => {
  const Layout = mobile ? MobileLayout : DesktopLayout;

  return (
    <>
      <Layout>
        <SessionListContent />
      </Layout>
      <SessionHydration />
    </>
  );
});

SessionPanel.displayName = 'SessionPanel';

export default SessionPanel;

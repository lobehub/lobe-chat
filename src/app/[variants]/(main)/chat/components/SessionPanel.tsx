import { Suspense, lazy, memo } from 'react';

import CircleLoading from '@/components/Loading/CircleLoading';

import SessionHydration from '../session/features/SessionHydration';
import SkeletonList from '../session/features/SkeletonList';
import DesktopLayout from '../session/layout/Desktop';
import MobileLayout from '../session/layout/Mobile';

const SessionListContent = lazy(() => import('../session/features/SessionListContent'));

interface SessionPanelProps {
  mobile?: boolean;
}

const SessionPanel = memo<SessionPanelProps>(({ mobile }) => {
  const Layout = mobile ? MobileLayout : DesktopLayout;

  return (
    <Suspense fallback={<CircleLoading />}>
      <Layout>
        <Suspense fallback={<SkeletonList />}>
          <SessionListContent />
        </Suspense>
      </Layout>
      <SessionHydration />
    </Suspense>
  );
});

SessionPanel.displayName = 'SessionPanel';

export default SessionPanel;

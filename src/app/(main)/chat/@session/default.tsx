import { Suspense, lazy } from 'react';

import CircleLoading from '@/components/Loading/CircleLoading';
import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SessionHydration from './features/SessionHydration';
import SkeletonList from './features/SkeletonList';

const SessionListContent = lazy(() => import('./features/SessionListContent'));

const Layout = ServerLayout({ Desktop, Mobile });

const Session = () => {
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
};

Session.displayName = 'Session';

export default Session;

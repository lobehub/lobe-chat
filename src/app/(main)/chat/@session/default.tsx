import { Suspense, lazy } from 'react';

import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SessionHydration from './features/SessionHydration';
import SkeletonList from './features/SkeletonList';

const SessionListContent = lazy(() => import('./features/SessionListContent'));

const Layout = ServerLayout({ Desktop, Mobile });

const Session = () => {
  return (
    <>
      <Layout>
        <Suspense fallback={<SkeletonList />}>
          <SessionListContent />
        </Suspense>
      </Layout>
      <SessionHydration />
    </>
  );
};

Session.displayName = 'Session';

export default Session;

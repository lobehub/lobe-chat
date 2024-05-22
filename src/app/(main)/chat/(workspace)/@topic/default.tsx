// import TopicListContent from './features/TopicListContent';
import React, { Suspense, lazy } from 'react';

import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SkeletonList from './features/SkeletonList';
import SystemRole from './features/SystemRole';

const TopicContent = lazy(() => import('./features/TopicListContent'));

const Topic = () => {
  const mobile = isMobileDevice();

  const Layout = mobile ? Mobile : Desktop;

  return (
    <>
      {!mobile && <SystemRole />}
      <Layout>
        <Suspense fallback={<SkeletonList />}>
          <TopicContent />
        </Suspense>
      </Layout>
    </>
  );
};

Topic.displayName = 'ChatTopic';

export default Topic;

// import TopicListContent from './features/TopicListContent';
import React, { Suspense, lazy } from 'react';

import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SkeletonList from './features/SkeletonList';
import SystemRole from './features/SystemRole';

const TopicContent = lazy(() => import('./features/TopicListContent'));

const Topic = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  const Layout = isMobile ? Mobile : Desktop;

  return (
    <>
      {!isMobile && <SystemRole />}
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

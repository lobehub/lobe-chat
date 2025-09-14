import React, { Suspense, lazy } from 'react';

import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SkeletonList from './features/SkeletonList';

const SidebarLayoutSwitcher = lazy(() => import('./SidebarLayoutSwitcher'));

const Topic = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  const Layout = isMobile ? Mobile : Desktop;

  return (
    <Layout>
      <Suspense fallback={<SkeletonList />}>
        <SidebarLayoutSwitcher />
      </Suspense>
    </Layout>
  );
};

Topic.displayName = 'ChatTopic';

export default Topic;

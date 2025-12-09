import dynamic from 'next/dynamic';
import React from 'react';

import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SkeletonList from './features/SkeletonList';
import Topic from './features/Topic';

const ConfigSwitcher = dynamic(() => import('./features/ConfigSwitcher'), {
  loading: () => <SkeletonList />,
});

const Sidebar = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  const Layout = isMobile ? Mobile : Desktop;

  return (
    <Layout>
      <ConfigSwitcher />
      <Topic />
    </Layout>
  );
};

Sidebar.displayName = 'ChatTopic';

export default Sidebar;

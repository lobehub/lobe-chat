import dynamic from 'next/dynamic';
import { memo } from 'react';

import DesktopLayout from './topic/_layout/Desktop';
import MobileLayout from './topic/_layout/Mobile';
import SkeletonList from './topic/features/SkeletonList';
import Topic from './topic/features/Topic';

const ConfigSwitcher = dynamic(() => import('./topic/features/ConfigSwitcher'), {
  loading: () => <SkeletonList />,
});

interface TopicSidebarProps {
  mobile?: boolean;
}

const TopicSidebar = memo<TopicSidebarProps>(({ mobile }) => {
  const Layout = mobile ? MobileLayout : DesktopLayout;

  return (
    <Layout>
      <ConfigSwitcher />
      <Topic />
    </Layout>
  );
});

TopicSidebar.displayName = 'TopicSidebar';

export default TopicSidebar;
